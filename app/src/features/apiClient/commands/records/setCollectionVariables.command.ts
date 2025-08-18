import { EnvironmentVariables } from "backend/environment/types";
import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { parseVariables } from "features/apiClient/store/variables/variables.store";
import { createOrderedVariableMap } from "../environments/utils";
import { getApiClientCollectionVariablesStore } from "../store.utils";
import { sanitizePatch } from "../utils";

export async function setCollectionVariables(
  ctx: ApiClientFeatureContext,
  params: { collectionId: string; variables: EnvironmentVariables }
) {
  const {
    repositories: { apiClientRecordsRepository },
  } = ctx;
  const variableStore = getApiClientCollectionVariablesStore(ctx, params.collectionId);

  if (!variableStore) throw new NativeError("set only allowed on existing Collection Variables");

  const varMap = createOrderedVariableMap(params.variables);

  const prunedPatch = sanitizePatch(varMap);
  await apiClientRecordsRepository.setCollectionVariables(params.collectionId, prunedPatch);
  variableStore.getState().reset(parseVariables(prunedPatch));
}
