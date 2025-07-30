import { ApiClientFeatureContext } from "./types";

export const createEnvironment = async (ctx: ApiClientFeatureContext, params: { newEnvironmentName: string }) => {
  const { repositories, stores } = ctx;
  const { newEnvironmentName } = params;

  try {
    const newEnvironment = await repositories.environmentVariablesRepository.createNonGlobalEnvironment(
      newEnvironmentName
    );

    stores.environments.getState().create({ id: newEnvironment.id, name: newEnvironment.name });
    return { id: newEnvironment.id, name: newEnvironment.name };
  } catch (err) {
    throw new Error(err);
  }
};
