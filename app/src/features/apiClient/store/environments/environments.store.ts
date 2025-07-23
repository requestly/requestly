import { EnvironmentMap } from "backend/environment/types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { create, StoreApi } from "zustand";
import { createVariablesStore, VariablesStore } from "../variables/variables.store";

type EnvironmentData = {
  variables: StoreApi<VariablesStore>;
};

type Environment = {
  id: string;
  name: string;
  data: EnvironmentData;
};

type GlobalEnvironment = Environment;

type EnvironmentsStore = {
  // state
  version: number;
  erroredRecords: ErroredRecord[];
  activeEnvironment?: Environment;
  globalEnvironment: GlobalEnvironment;
  environments: Map<Environment["id"], Environment>;

  // actions
  delete: (id: string) => void;
  create: (params: Omit<Environment, "data">) => void;
  update: (id: string, updates: Pick<Environment, "name">) => void;
  getEnvironment: (id: string) => Environment;
  getAll: () => Environment[];
  setActive: (id?: string) => void;
  incrementVersion: () => void;
};

const getEnvironmentsWithVariableStore = (rawEnvironments: EnvironmentMap): EnvironmentsStore["environments"] => {
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

export const createEnvironmentsStore = ({
  environments,
  erroredRecords,
}: {
  environments: EnvironmentMap;
  erroredRecords: ErroredRecord[];
}) => {
  const environmentsWithVariableStore = getEnvironmentsWithVariableStore(environments);

  return create<EnvironmentsStore>()((set, get) => ({
    version: 0,
    erroredRecords,
    activeEnvironment: null,
    environments: environmentsWithVariableStore,
    globalEnvironment: environmentsWithVariableStore.get("global"), // FIXME: update hard coded id

    delete(id) {
      const { environments } = get();
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
      const { environments } = get();
      return Object.values(environments).filter((env) => env.id !== "global");
    },

    setActive(id) {
      if (!id) {
        set({ activeEnvironment: null });
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
