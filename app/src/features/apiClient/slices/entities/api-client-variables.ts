import { EnvironmentVariables } from "backend/environment/types";
import lodash from "lodash";
import { v4 as uuidv4 } from "uuid";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { DeepPartial, EntityNotFound } from "../types";
import getStoredState from "redux-persist/es/getStoredState";
import { PersistConfig } from "redux-persist";

type Variable = EnvironmentVariables[0];

export class ApiClientVariables<T> {
  constructor(
    readonly getVariableObject: (entity: T) => EnvironmentVariables,
    readonly unsafePatch: (patcher: (state: T) => void) => void,
    readonly getEntityFromState: (state: ApiClientStoreState) => T
  ) {}

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

  set(params: Pick<Variable, "id"> & Partial<Omit<Variable, "id">>) {
    const { id, ...variableData } = params;
    this.unsafePatch((s) => {
      const variables = this.getVariableObject(s);
      let variable = lodash.find(variables, (v) => v.id === params.id);
      if (!variable) {
        return;
      }
      lodash.extend(variable, variableData);
    });
  }

  get(state: ApiClientStoreState, id: Variable["id"]) {
    const entity = this.getEntityFromState(state);
    const variables = this.getVariableObject(entity);
    const variable = lodash.find(variables, (v) => v.id === id);
    if (!variable) {
      throw new EntityNotFound(id.toString(), "variable");
    }
    return variable;
  }

  getAll(state: ApiClientStoreState) {
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
}
