import { EnvironmentData, EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const createEnvironments = async (
  ctx: ApiClientFeatureContext,
  params: { environmentsToCreate: { newEnvironmentName: string; variables?: EnvironmentVariables }[] }
) => {
  const {
    stores,
    repositories: { environmentVariablesRepository },
  } = ctx;
  const { environmentsToCreate } = params;

  if (environmentsToCreate.length === 0) {
    return [];
  }

  const envsResult = await environmentVariablesRepository.createEnvironments(
    (environmentsToCreate as unknown) as EnvironmentData[] // FIXME: fix type
  );

  stores.environments.getState().createEnvironments(envsResult);
  return envsResult;
};
