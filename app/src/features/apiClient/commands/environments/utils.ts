import { EnvironmentData } from "backend/environment/types";
import { Environment } from "features/apiClient/store/environments/environments.store";

export const _environmentDataAdapter = (env: Environment): EnvironmentData => {
  return {
    id: env.id,
    name: env.name,
    variables: Object.fromEntries(env.data.variables.getState().getAll()),
  };
};
