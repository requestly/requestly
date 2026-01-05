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
    private readonly unsafePatch: (patcher: (state: T) => void) => void,
    private readonly getEntityFromState: (state: State) => T
  ) { }

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
    });
  }

  add(params: Omit<Variable, "id"> & { key: string }) {
    const id = uuidv4();
    const { key, ...variableData } = params;
    const variable: Variable = {
      id,
      ...variableData,
    };
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      // lodash.extend(variables, {[key]: variable});
      variables[key] = variable;
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
      lodash.extend(variable, variableData);
      if (params.key) {
        if (oldKey !== params.key) {
          variables[params.key] = variable;
          delete variables[oldKey];
        }
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
    });
  }

  delete(id: Variable["id"]): void {
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      const entry = Object.entries(variables).find(([_, v]) => v.id === id);
      if (entry) {
        delete variables[entry[0]];
      }
    });
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
        return;
      }
      ApiClientVariables.merge(params.getVariablesFromRecord(r), persistedVariables);
    }
    return params.records;
  }

  static perist(
    variables: EnvironmentVariables,
    config: {
      isPersisted?: boolean;
    }
  ) {
    return lodash.mapValues(variables, (v) => ({
      localValue: (config ? config.isPersisted : v.isPersisted) ? v.localValue : undefined,
    }));
  }

  /**
   * Persists full variable data, conditionally including localValue based on each variable's isPersisted flag.
   * Unlike `perist` which only keeps localValue for overlay merging, this preserves the complete variable structure.
   * Suitable for slices where variables are self-contained and don't need hydrate-in-place merging.
   */
  static persistFull(variables: EnvironmentVariables) {
    return lodash.mapValues(variables, (v) => ({
      ...v,
      localValue: v.isPersisted ? v.localValue : undefined,
    }));
  }
}
