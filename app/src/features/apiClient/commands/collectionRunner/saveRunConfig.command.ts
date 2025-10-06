import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { NativeError } from "errors/NativeError";
import { SavedRunConfig } from "./types";

export async function saveRunConfig(
  ctx: ApiClientFeatureContext,
  params: {
    collectionId: RQAPI.ApiClientRecord["collectionId"];
    configToSave: SavedRunConfig;
  }
) {
  const { collectionId, configToSave } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.upsertRunConfig(collectionId, configToSave);

  if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
    throw new NativeError("Something went wrong while saving run config!").addContext({
      collectionId,
      configToSave,
    });
  }
}
