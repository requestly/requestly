import { EnvironmentVariables } from "backend/environment/types";
import { getApiClientCollectionVariablesStore } from "../store.utils";
import { NativeError } from "errors/NativeError";
import { parseEnvVariables } from "features/apiClient/store/variables/variables.store";
import { sanitizePatch } from "../utils";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export async function patchCollectionVariables(
  ctx: ApiClientFeatureContext,
  params: { collectionId: string; variables: EnvironmentVariables }
) {
  const {
    repositories: { apiClientRecordsRepository },
  } = ctx;
  const variableStore = getApiClientCollectionVariablesStore(ctx, params.collectionId);
  if (!variableStore) throw new NativeError("set only allowed on existing variable stores");

  const currentVariables = Object.fromEntries(variableStore.getState().data.entries());
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

  const prunedPatch = sanitizePatch(finalVariables) as EnvironmentVariables;
  await apiClientRecordsRepository.setCollectionVariables(params.collectionId, prunedPatch);
  variableStore.getState().reset(parseEnvVariables(prunedPatch));
}
