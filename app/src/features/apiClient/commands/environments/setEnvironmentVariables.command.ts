import { EnvironmentVariables } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { parseVariables } from "features/apiClient/store/variables/variables.store";
import { createOrderedVariableMap } from "./utils";

export async function setEnvironmentVariables(
  ctx: ApiClientFeatureContext,
  params: { environmentId: string; variables: EnvironmentVariables }
) {
  const {
    repositories: { environmentVariablesRepository },
    stores: { environments },
  } = ctx;
  const environmentStore = environments.getState().getEnvironment(params.environmentId);

  if (!environmentStore) throw new NativeError("set only allowed on existing variable stores");

  const varStore = environmentStore.data.variables;

  const varMap = createOrderedVariableMap(params.variables);

  await environmentVariablesRepository.updateEnvironment(params.environmentId, { variables: varMap });
  varStore.getState().reset(parseVariables(varMap));
}
