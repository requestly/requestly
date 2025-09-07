import { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import { create, StoreApi } from "zustand";
import { EnvVariableState } from "../variables/variables.store";
import { NativeError } from "errors/NativeError";
import { PersistedVariables } from "../shared/variablePersistence";

type EnvironmentData = {
  variables: StoreApi<EnvVariableState>;
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
  create: (params: Pick<EnvironmentState, "id" | "name"> & { variables?: EnvironmentVariables }) => EnvironmentState;
  createEnvironments: (
    params: (Pick<EnvironmentState, "id" | "name"> & { variables?: EnvironmentVariables })[]
  ) => EnvironmentState[];
  updateEnvironment: (id: string, updates: Pick<EnvironmentState, "name">) => void;
  getEnvironment: (id: string) => EnvironmentState | undefined;
  getActiveEnvironment: () => EnvironmentState | null;
  getAll: () => EnvironmentState[];
  getAllEnvironmentStores: () => EnvironmentStore[];
  setActive: (id?: string) => void;
  refresh: (params: { globalEnvironment: EnvironmentMap[string]; environments: EnvironmentMap }) => void;
};

export function createEnvironmentStore(
  id: string,
  name: string,
  variables: EnvironmentVariables,
  contextId: string = "private"
) {
  const variablesStore = PersistedVariables.createEnvironmentVariablesStore(contextId, id, variables);
  return create<EnvironmentState>((set) => ({
    id,
    name,
    data: {
      variables: variablesStore,
    },

    update(patch) {
      set(patch);
    },
  }));
}

const parseEnvironments = (rawEnvironments: EnvironmentMap, contextId: string): EnvironmentsState["environments"] => {
  const environmentsWithVariableStore = Object.values(rawEnvironments).map((value) => {
    return createEnvironmentStore(value.id, value.name, value.variables, contextId);
  });

  return environmentsWithVariableStore;
};

const parseGlobalEnvironment = (globalEnv: EnvironmentMap[string], contextId: string): GlobalEnvironmentStore => {
  return createEnvironmentStore(globalEnv.id, globalEnv.name, globalEnv.variables, contextId);
};

export const createEnvironmentsStore = ({
  environments,
  globalEnvironment,
  contextId,
}: {
  environments: EnvironmentMap;
  globalEnvironment: EnvironmentMap[string];
  contextId: string;
}) => {
  const environmentsWithVariableStore = parseEnvironments(environments, contextId);
  const globalEnvWithVariableStore = parseGlobalEnvironment(globalEnvironment, contextId);

  const persistedActiveEnvId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ENV_ID_KEY);
  const activeEnvironment = persistedActiveEnvId
    ? environmentsWithVariableStore.find((env) => env.getState().id === persistedActiveEnvId) || null
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

    create({ id, name, variables }) {
      const { environments } = get();

      const env = get().getEnvironment(id);
      if (env) {
        return env;
      }

      const newEvn = createEnvironmentStore(id, name, variables || {});
      set({
        environments: [...environments, newEvn],
      });

      return newEvn.getState();
    },

    createEnvironments(environmentsToCreate) {
      const { create } = get();
      return environmentsToCreate.map((env) => create(env));
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
      const { environments, globalEnvironment } = get();

      const globalEnvState = globalEnvironment.getState();

      const environmentState =
        globalEnvState.id === id ? globalEnvState : environments.find((e) => e.getState().id === id)?.getState();

      return environmentState;
    },

    getActiveEnvironment() {
      return get().activeEnvironment?.getState() ?? null;
    },

    getAll() {
      return get().environments.map((s) => s.getState());
    },

    getAllEnvironmentStores() {
      return get().environments;
    },

    setActive(id) {
      if (!id) {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_ENV_ID_KEY);
        set({ activeEnvironment: null });
        return;
      }

      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ENV_ID_KEY, id);
      const { environments } = get();
      const environment = environments.find((e) => e.getState().id === id);
      if (!environment) {
        throw new NativeError("Environment does not exist!").addContext({ environmentId: id });
      }

      set({ activeEnvironment: environment });
    },

    refresh(params) {
      const { create, delete: deleteEnvironment, getEnvironment, environments } = get();

      for (const environmentId in params.environments) {
        const environment = params.environments[environmentId];
        const existingEnvironment = getEnvironment(environmentId);
        if (!existingEnvironment) {
          create({
            id: environment.id,
            name: environment.name,
            variables: environment.variables,
          });
        } else {
          existingEnvironment.update({
            name: environment.name,
          });
          existingEnvironment.data.variables.getState().resetSyncValues(new Map(Object.entries(environment.variables)));
        }
      }

      for (const environmentStore of environments) {
        const environmentState = environmentStore.getState();
        if (!params.environments[environmentState.id]) {
          deleteEnvironment(environmentState.id);
        }
      }

      set({
        globalEnvironment: parseGlobalEnvironment(params.globalEnvironment, contextId),
      });
    },
  }));
};
