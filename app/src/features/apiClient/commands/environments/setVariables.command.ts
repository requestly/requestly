import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { ApiClientFeatureContext } from "./types";

export const setVariables = async (
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; variables: EnvironmentVariables }
) => {
  const { repositories, stores } = ctx;
  const { environmentId, variables } = params;

  try {
    const newVariablesWithSyncvalues: EnvironmentVariables = Object.fromEntries(
      Object.entries(variables).map(([key, value], index) => {
        const typeToSaveInDB =
          value.type === EnvironmentVariableType.Secret
            ? EnvironmentVariableType.Secret
            : (typeof value.syncValue as EnvironmentVariableType);
        return [
          key.trim(),
          { localValue: value.localValue, syncValue: value.syncValue, type: typeToSaveInDB, id: index },
        ];
      })
    );

    await repositories.environmentVariablesRepository.updateEnvironment(environmentId, {
      variables: newVariablesWithSyncvalues,
    });

    const env = stores.environments.getState().getEnvironment(environmentId);

    if (!env) {
      throw new Error("Environment not found! ");
    }

    env.data.variables.getState().mergeAndUpdate(newVariablesWithSyncvalues);
  } catch (err) {
    throw new Error(err);
  }
};
