import { ApiClientFeatureContext } from "./types";

export const createEnvironment = async (ctx: ApiClientFeatureContext, params: { newEnvironmentName: string }) => {
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

  return { id: newEnvironment.id, name: newEnvironment.name };
};
