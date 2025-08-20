import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const createEnvironments = async (
  ctx: ApiClientFeatureContext,
  params: { environmentsToCreate: { name: string; variables: EnvironmentVariables }[] }
) => {
  const {
    stores,
    repositories: { environmentVariablesRepository },
  } = ctx;
  const { environmentsToCreate } = params;

  if (environmentsToCreate.length === 0) {
    return [];
  }
  const envsResult = await environmentVariablesRepository.createEnvironments(environmentsToCreate);

  stores.environments.getState().createEnvironments(envsResult);
  return envsResult;
};
