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

  const finalVariables: EnvironmentVariables = {};

  const usedIds = new Set<number>(Object.values(currentVariables).map((variable) => variable.id));
  let nextId = usedIds.size ? Math.max(...usedIds) + 1 : 0;

  Object.keys(rawNewVariables).forEach((key) => {
    if (currentVariables[key]) {
      finalVariables[key] = { ...currentVariables[key], ...rawNewVariables[key], id: currentVariables[key].id };
    } else {
      finalVariables[key] = { ...rawNewVariables[key], id: nextId };
      while (usedIds.has(nextId)) nextId++;
      finalVariables[key] = { ...rawNewVariables[key], id: nextId };
      usedIds.add(nextId);
      nextId++;
    }
  });

  await environmentVariablesRepository.updateEnvironment(params.environmentId, { variables: finalVariables });
  varStore.getState().reset(parseEnvVariables(finalVariables));
}
