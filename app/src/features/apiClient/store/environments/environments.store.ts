import { EnvironmentMap } from "backend/environment/types";
import { create, StoreApi } from "zustand";
import { createVariablesStore, VariablesStore } from "../variables/variables.store";
import { NativeError } from "errors/NativeError";

type EnvironmentData = {
  variables: StoreApi<VariablesStore>;
};

export type Environment = {
  id: string;
  name: string;
  data: EnvironmentData;
};

export type GlobalEnvironment = Environment;

export type EnvironmentsState = {
  // state
  version: number;
  activeEnvironment: Environment | null;
  globalEnvironment: GlobalEnvironment;
  environments: Map<Environment["id"], Environment>;

  // actions
  delete: (id: string) => void;
  create: (params: Omit<Environment, "data">) => void;
  update: (id: string, updates: Pick<Environment, "name">) => void;
  getEnvironment: (id: string) => Environment | undefined;
  getAll: () => Map<Environment["id"], Environment>;
  setActive: (id?: string) => void;
  incrementVersion: () => void;
};

const parseEnvironments = (rawEnvironments: EnvironmentMap): EnvironmentsState["environments"] => {
  const environmentsWithVariableStore = Object.values(rawEnvironments).map((value) => {
    return [
      value.id,
      {
        id: value.id,
        name: value.name,
        data: { variables: createVariablesStore({ variables: value.variables }) },
      },
    ] as [Environment["id"], Environment];
  });

  return new Map(environmentsWithVariableStore);
};

const parseGlobalEnvironment = (globalEnv: EnvironmentMap[string]): GlobalEnvironment => {
  return {
    id: globalEnv.id,
    name: globalEnv.name,
    data: { variables: createVariablesStore({ variables: globalEnv.variables }) },
  };
};

export const createEnvironmentsStore = ({
  environments,
  globalEnvironment,
}: {
  environments: EnvironmentMap;
  globalEnvironment: EnvironmentMap[string];
}) => {
  const environmentsWithVariableStore = parseEnvironments(environments);
  const globalEnvWithVariableStore = parseGlobalEnvironment(globalEnvironment);

  return create<EnvironmentsState>()((set, get) => ({
    version: 0,
    activeEnvironment: null,
    environments: environmentsWithVariableStore,
    globalEnvironment: globalEnvWithVariableStore,

    delete(id) {
      const { environments } = get();

      if (!environments.has(id)) {
        return;
      }

      environments.delete(id);
      set({ environments });
      get().incrementVersion();
    },

    create({ id, name }) {
      const { environments } = get();
      environments.set(id, { id, name, data: { variables: createVariablesStore({ variables: {} }) } });
      set({ environments });
      get().incrementVersion();
    },

    update(id, updates) {
      const { environments } = get();
      const existingValue = environments.get(id);

      if (!existingValue) {
        throw new NativeError("Environment does not exist!").addContext({ environmentId: id });
      }

      const updatedValue = { ...existingValue, name: updates.name };
      environments.set(id, updatedValue);

      set({ environments });
      get().incrementVersion();
    },

    getEnvironment(id) {
      const { environments } = get();
      return environments.get(id);
    },

    getAll() {
      return get().environments;
    },

    setActive(id) {
      if (!id) {
        set({ activeEnvironment: null });
        get().incrementVersion();
        return;
      }

      set({ activeEnvironment: get().getEnvironment(id) });
      get().incrementVersion();
    },

    incrementVersion() {
      set({
        version: get().version + 1,
      });
    },
  }));
};
