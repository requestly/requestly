import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { NativeError } from "errors/NativeError";

export const patchEnvironmentVariables = async (
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; patch: EnvironmentVariables }
) => {
  const { repositories, stores } = ctx;
  const { environmentId, patch } = params;

  const env = stores.environments.getState().getEnvironment(environmentId);

  if (!env) {
    throw new NativeError("Environment not found!").addContext({ environmentId });
  }

  const newVariablesWithSyncvalues: EnvironmentVariables = Object.fromEntries(
    Object.entries(patch).map(([key, value], index) => {
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

  env.data.variables.getState().mergeAndUpdate(newVariablesWithSyncvalues);
};
