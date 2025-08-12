import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { patchEnvironmentVariables } from "./patchEnvironmentVariables.command";

export const createEnvironment = async (
  ctx: ApiClientFeatureContext,
  params: { newEnvironmentName: string; variables?: EnvironmentVariables }
) => {
  const { repositories, stores } = ctx;
  const { newEnvironmentName } = params;

  const newEnvironment = await repositories.environmentVariablesRepository.createNonGlobalEnvironment(
    newEnvironmentName
  );

  stores.environments.getState().create({ id: newEnvironment.id, name: newEnvironment.name });

  const environments = stores.environments.getState().environments;
  if (environments.length === 1) {
    stores.environments.getState().setActive(newEnvironment.id);
  }

  if (params.variables) {
    await patchEnvironmentVariables(ctx, {
      environmentId: newEnvironment.id,
      variables: params.variables,
    });
  }

  return { id: newEnvironment.id, name: newEnvironment.name };
};
