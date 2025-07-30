import { ApiClientFeatureContext } from "./types";

export const renameEnvironment = async (
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; newName: string }
) => {
  const { repositories, stores } = ctx;
  const { environmentId, newName } = params;

  try {
    await repositories.environmentVariablesRepository.updateEnvironment(environmentId, { name: newName });
    stores.environments.getState().update(environmentId, { name: newName });
  } catch (err) {
    throw new Error(err);
  }
};
