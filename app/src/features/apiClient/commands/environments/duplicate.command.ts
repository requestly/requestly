import { EnvironmentMap } from "backend/environment/types";
import { parseEnvironmentState } from "./utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const duplicateEnvironment = async (ctx: ApiClientFeatureContext, params: { environmentId: string }) => {
  const { repositories, stores } = ctx;
  const { environmentId } = params;

  const envsMap: EnvironmentMap = {};
  stores.environments
    .getState()
    .getAll()
    .forEach((value) => {
      const environmentState = stores.environments.getState().getEnvironment(value.id);
      if (!environmentState) {
        return;
      }
      envsMap[value.id] = parseEnvironmentState(environmentState);
    });

  const newEnvironment = await repositories.environmentVariablesRepository.duplicateEnvironment(environmentId, envsMap);

  stores.environments
    .getState()
    .create({ id: newEnvironment.id, name: newEnvironment.name, variables: newEnvironment.variables });
};
