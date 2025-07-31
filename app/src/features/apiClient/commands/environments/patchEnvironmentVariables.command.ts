import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { NativeError } from "errors/NativeError";
import { sanitizePatch } from "../utils";

export const patchEnvironmentVariables = async (
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; patch: EnvironmentVariables }
) => {
  const { repositories, stores } = ctx;
  const { environmentId, patch } = params;
  const environmentStore = stores.environments.getState();
  const globalEnv = environmentStore.globalEnvironment.getState();

  const env = globalEnv.id === environmentId ? globalEnv : stores.environments.getState().getEnvironment(environmentId);

  if (!env) {
    throw new NativeError("Environment not found!").addContext({ environmentId });
  }

  const newVariablesWithSyncvalues: EnvironmentVariables = sanitizePatch(patch);

  await repositories.environmentVariablesRepository.updateEnvironment(environmentId, {
    variables: newVariablesWithSyncvalues,
  });

  env.data.variables.getState().mergeAndUpdate(newVariablesWithSyncvalues);
};
