import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const renameEnvironment = async (
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; newName: string }
) => {
  const { repositories, stores } = ctx;
  const { environmentId, newName } = params;

  await repositories.environmentVariablesRepository.updateEnvironment(environmentId, { name: newName });
  stores.environments.getState().updateEnvironment(environmentId, { name: newName });
};
