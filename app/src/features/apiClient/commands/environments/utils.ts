import { EnvironmentData, EnvironmentVariables } from "backend/environment/types";
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

/* id in the variable map represents order */
export function createOrderedVariableMap(variableMap: EnvironmentVariables): EnvironmentVariables {
  const result = Object.fromEntries(
    Array.from(Object.entries(variableMap))
      .sort(([_aIdx, aVal], [_bIdx, bVal]) => {
        return aVal.id - bVal.id;
      })
      .map(([key, value], index) => {
        const newValue = {
          ...value,
          id: index,
        };

        return [key, newValue];
      })
  );
  return result;
}
