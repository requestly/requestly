import { EnvironmentData } from "backend/environment/types";
import {
  EnvironmentState,
  EnvironmentStore,
  EnvironmentsState,
} from "features/apiClient/store/environments/environments.store";

export const parseEnvironmentState = (env: EnvironmentState): EnvironmentData => {
  const { id, name, data } = env;
  return {
    id,
    name,
    variables: Object.fromEntries(data.variables.getState().getAll()),
  };
};

export const parseEnvironmentStore = (env: EnvironmentStore): EnvironmentData => {
  return parseEnvironmentState(env.getState());
};

export const parseEnvironmentsStore = (envs: EnvironmentsState["environments"]): EnvironmentData[] => {
  return envs.map(parseEnvironmentStore);
};
