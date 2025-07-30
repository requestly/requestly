import { ApiClientFeatureContext } from "./types";

export const deleteEnvironment = async (ctx: ApiClientFeatureContext, params: { environmentId: string }) => {
  const { repositories, stores } = ctx;
  const { environmentId } = params;

  await repositories.environmentVariablesRepository.deleteEnvironment(environmentId);
  stores.environments.getState().delete(environmentId);
};
