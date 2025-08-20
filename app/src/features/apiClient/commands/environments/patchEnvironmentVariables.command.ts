import { EnvironmentVariables } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { parseEnvVariables } from "features/apiClient/store/variables/variables.store";

export async function patchEnvironmentVariables(
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

  const currentVariables = Object.fromEntries(varStore.getState().data.entries());
  const rawNewVariables = params.variables;

  const finalVariables = { ...currentVariables };

  let counter = Object.keys(currentVariables).length;
  Object.keys(rawNewVariables).forEach((key) => {
    // merge keys
    if (finalVariables[key]) {
      finalVariables[key] = { ...finalVariables[key], ...rawNewVariables[key], id: currentVariables[key].id };
    } else {
      // create new ids
      finalVariables[key] = { ...rawNewVariables[key], id: counter };
      counter++;
    }
  });

  await environmentVariablesRepository.updateEnvironment(params.environmentId, { variables: finalVariables });
  varStore.getState().reset(parseEnvVariables(finalVariables));
}
