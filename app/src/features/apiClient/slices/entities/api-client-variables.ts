import { EnvironmentVariables } from "backend/environment/types";
import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { DeepPartial, EntityNotFound } from "../types";
import getStoredState from "redux-persist/es/getStoredState";
import { PersistConfig } from "redux-persist";

type Variable = EnvironmentVariables[0];

export class ApiClientVariables<T, State = ApiClientStoreState> {
  constructor(
    private readonly getVariableObject: (entity: T) => EnvironmentVariables,
    private readonly getOrderArray: (entity: T) => string[] | undefined,
    private readonly unsafePatch: (patcher: (state: T) => void) => void,
    private readonly getEntityFromState: (state: State) => T
  ) {}

  refresh(params: EnvironmentVariables) {
    this.clearAll();
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      for (const key in params) {
        if (!params[key]) {
          continue;
        }
        variables[key] = params[key];
      }

      // Initialize order array from params
      this.initializeOrder(s, Object.keys(params));
    });
  }

  /**
   * Adds or updates (upserts) a variable.
   * If a variable with the same key exists, it merges the new data with the existing variable.
   * Note: Despite the name "add", this method performs an upsert operation.
   */
  add(params: Omit<Variable, "id"> & { key: string; id?: string | number }) {
    const id = params.id ?? uuidv4();
    const { key, id: _id, ...variableData } = params;
    const variable: Variable = {
      id: typeof id === "number" ? id : parseInt(id, 10) || 0,
      ...variableData,
    };
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);

      if (!variables[key]) {
        variables[key] = variable;
        // Add to order array
        this.addToOrder(s, key);
      } else {
        // Upsert: merge with existing variable
        variables[key] = {
          ...variables[key],
          ...variable,
        };
      }
    });

    return id;
  }

  set(params: Pick<Variable, "id"> & Partial<Omit<Variable, "id">> & { key?: string }) {
    const { id, ...variableData } = params;
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      const entry = Object.entries(variables).find(([_, v]) => v.id === params.id);
      if (!entry) {
        return;
      }
      const [oldKey, variable] = entry;

      if (params.key && oldKey !== params.key) {
        // Check if new key already exists with different id
        if (variables[params.key] && variables[params.key]?.id !== params.id) {
          lodash.extend(variable, variableData);
          return;
        }

        // Delete old key and add new key
        delete variables[oldKey];
        variables[params.key] = { ...variable, ...variableData };

        // Update order array
        this.replaceInOrder(s, oldKey, params.key);
      } else {
        // Just update the variable (no key change)
        lodash.extend(variable, variableData);
      }
    });
  }

  get(state: State, id: Variable["id"]) {
    const entity = this.getEntityFromState(state);
    const variables = this.getVariableObject(entity);
    const variable = lodash.find(variables, (v) => v.id === id);
    if (!variable) {
      throw new EntityNotFound(id.toString(), "variable");
    }
    return variable;
  }

  getAll(state: State) {
    const entity = this.getEntityFromState(state);
    const variables = this.getVariableObject(entity);
    return variables;
  }

  clearAll() {
    this.unsafePatch((state) => {
      const variables = this.getVariableObject(state);
      const keys = Object.keys(variables);
      keys.forEach((key) => lodash.unset(variables, key));

      // Clear order array
      this.clearOrder(state);
    });
  }

  delete(id: Variable["id"]): void {
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      const entry = Object.entries(variables).find(([_, v]) => v.id === id);
      if (entry) {
        const [key] = entry;
        delete variables[key];

        // Remove from order array
        this.removeFromOrder(s, key);
      }
    });
  }

  getOrder(state: State): string[] | undefined {
    const entity = this.getEntityFromState(state);
    return this.getOrderArray(entity);
  }

  // Helper methods for order management
  private getOrderArrayFromEntity(entity: T): string[] | undefined {
    return this.getOrderArray(entity);
  }

  private initializeOrder(entity: T, keys: string[]): void {
    const order = this.getOrderArrayFromEntity(entity);
    if (order !== undefined) {
      order.length = 0;
      order.push(...keys);
    }
  }

  private addToOrder(entity: T, key: string): void {
    const order = this.getOrderArrayFromEntity(entity);
    if (order && !order.includes(key)) {
      order.push(key);
    }
  }

  private removeFromOrder(entity: T, key: string): void {
    const order = this.getOrderArrayFromEntity(entity);
    if (order) {
      const index = order.indexOf(key);
      if (index !== -1) {
        order.splice(index, 1);
      }
    }
  }

  private replaceInOrder(entity: T, oldKey: string, newKey: string): void {
    const order = this.getOrderArrayFromEntity(entity);
    if (order) {
      const oldIndex = order.indexOf(oldKey);
      if (oldIndex !== -1) {
        order[oldIndex] = newKey;
      } else {
        // Key wasn't in order, add it
        order.push(newKey);
      }
    }
  }

  private clearOrder(entity: T): void {
    const order = this.getOrderArrayFromEntity(entity);
    if (order) {
      order.length = 0;
    }
  }

  static merge(object: EnvironmentVariables, source: DeepPartial<EnvironmentVariables>) {
    for (const key in object) {
      if (source[key]) {
        lodash.merge(object[key], source[key]);
      }
    }
  }

  static async hydrateInPlace<T, P1, P2, P3, P4>(params: {
    records: T[];
    persistConfig: PersistConfig<P1, P2, P3, P4>;
    getVariablesFromRecord: (record: T) => EnvironmentVariables;
    getVariablesFromPersistedData: (record: T, persistedData: P1) => DeepPartial<EnvironmentVariables> | undefined;
  }) {
    const storedState = (await getStoredState(params.persistConfig)) as P1 | undefined;
    if (!storedState) {
      return;
    }
    for (const r of params.records) {
      const persistedVariables = params.getVariablesFromPersistedData(r, storedState);
      if (!persistedVariables) {
        continue;
      }
      ApiClientVariables.merge(params.getVariablesFromRecord(r), persistedVariables);
    }
    return params.records;
  }

  static persist(
    variables: EnvironmentVariables,
    config: {
      isPersisted?: boolean;
    },
    order?: string[]
  ) {
    return {
      variables: lodash.mapValues(variables, (v) => ({
        localValue: (config ? config.isPersisted : v.isPersisted) ? v.localValue : undefined,
      })),
      order: order,
    };
  }

  /**
   * Persists full variable data, conditionally including localValue based on each variable's isPersisted flag.
   * Unlike `persist` which only keeps localValue for overlay merging, this preserves the complete variable structure.
   * Suitable for slices where variables are self-contained and don't need hydrate-in-place merging.
   */
  static persistFull(variables: EnvironmentVariables, order?: string[]) {
    return {
      variables: lodash.mapValues(variables, (v) => ({
        ...v,
        localValue: v.isPersisted ? v.localValue : undefined,
      })),
      order: order,
    };
  }
}
