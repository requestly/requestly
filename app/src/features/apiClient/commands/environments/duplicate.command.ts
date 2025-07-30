import { EnvironmentMap } from "backend/environment/types";
import { _environmentDataAdapter } from "./utils";
import { Environment } from "features/apiClient/store/environments/environments.store";
import { ApiClientFeatureContext } from "./types";

export const duplicateEnvironment = async (ctx: ApiClientFeatureContext, params: { environmentId: string }) => {
  const { repositories, stores } = ctx;
  const { environmentId } = params;

  const envsMap: EnvironmentMap = {};
  stores.environments
    .getState()
    .getAll()
    .forEach((value) => {
      envsMap[value.id] = _environmentDataAdapter(
        stores.environments.getState().getEnvironment(value.id) as Environment
      );
    });

  const newEnvironment = await repositories.environmentVariablesRepository.duplicateEnvironment(environmentId, envsMap);

  stores.environments.getState().create({ id: newEnvironment.id, name: newEnvironment.name });
  stores.environments
    .getState()
    .getEnvironment(newEnvironment.id)!
    .data.variables.getState()
    .mergeAndUpdate(newEnvironment.variables);
};
