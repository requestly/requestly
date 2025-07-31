import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "./types";
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
      patch: params.variables,
    });
  }

  return { id: newEnvironment.id, name: newEnvironment.name };
};
