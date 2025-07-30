import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { create, StoreApi } from "zustand";
import { createVariablesStore, VariablesState } from "../variables/variables.store";
import { NativeError } from "errors/NativeError";

type EnvironmentData = {
  variables: StoreApi<VariablesState>;
};

export const LOCAL_STORAGE_ACTIVE_ENV_ID_KEY = "__rq_api_client_active_environment_id";

export type EnvironmentState = {
  id: string;
  name: string;
  data: EnvironmentData;

  update: (patch: Pick<EnvironmentState, "name">) => void;
};

export type EnvironmentStore = StoreApi<EnvironmentState>;

export type GlobalEnvironmentStore = EnvironmentStore;

export type EnvironmentsState = {
  // state
  activeEnvironment: EnvironmentStore | null;
  globalEnvironment: GlobalEnvironmentStore;
  environments: EnvironmentStore[];

  // actions
  delete: (id: string) => void;
  create: (params: Pick<EnvironmentState, "id" | "name">) => void;
  updateEnvironment: (id: string, updates: Pick<EnvironmentState, "name">) => void;
  getEnvironment: (id: string) => EnvironmentState | undefined;
  getAll: () => EnvironmentState[];
  getAllEnvironmentStores: () => EnvironmentStore[];
  setActive: (id?: string) => void;
};

export function createEnvironmentStore(id: string, name: string, variables: EnvironmentVariables) {
  return create<EnvironmentState>((set, get) => ({
    id,
    name,
    data: {
      variables: createVariablesStore({
        variables,
      }),
    },

    update(patch) {
      set(patch);
    },
  }));
}

const parseEnvironments = (rawEnvironments: EnvironmentMap): EnvironmentsState["environments"] => {
  const environmentsWithVariableStore = Object.values(rawEnvironments).map((value) => {
    return createEnvironmentStore(value.id, value.name, value.variables);
  });

  return environmentsWithVariableStore;
};

const parseGlobalEnvironment = (globalEnv: EnvironmentMap[string]): GlobalEnvironmentStore => {
  return createEnvironmentStore(globalEnv.id, globalEnv.name, globalEnv.variables);
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

  const persistedActiveEnvId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ENV_ID_KEY);
  const activeEnvironment = persistedActiveEnvId
    ? environmentsWithVariableStore.find((env) => env.getState().id === persistedActiveEnvId)
    : null;

  return create<EnvironmentsState>()((set, get) => ({
    activeEnvironment,
    environments: environmentsWithVariableStore,
    globalEnvironment: globalEnvWithVariableStore,

    delete(id) {
      const { environments } = get();

      const isExist = get().getEnvironment(id);
      if (!isExist) {
        return;
      }

      set({ environments: environments.filter((env) => env.getState().id !== id) });
    },

    create({ id, name }) {
      const { environments } = get();

      const env = get().getEnvironment(id);
      if (env) {
        return env;
      }

      set({
        environments: [...environments, createEnvironmentStore(id, name, {})],
      });
    },

    updateEnvironment(id, updates) {
      const { environments } = get();
      const existingValue = environments.find((e) => e.getState().id === id);

      if (!existingValue) {
        throw new NativeError("Environment does not exist!").addContext({ environmentId: id });
      }

      existingValue.setState(updates);
    },

    getEnvironment(id) {
      const { environments } = get();
      return environments.find((env) => env.getState().id === id)?.getState();
    },

    getAll() {
      return get().environments.map((s) => s.getState());
    },

    getAllEnvironmentStores() {
      return get().environments;
    },

    setActive(id) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ENV_ID_KEY, id);

      if (!id) {
        set({ activeEnvironment: null });
        return;
      }

      const { environments } = get();
      const environment = environments.find((e) => e.getState().id === id);
      if (!environment) {
        throw new NativeError("Environment does not exist!").addContext({ environmentId: id });
      }

      set({ activeEnvironment: environment });
    },
  }));
};
