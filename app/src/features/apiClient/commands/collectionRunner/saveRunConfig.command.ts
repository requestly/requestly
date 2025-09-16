import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { NativeError } from "errors/NativeError";
import { SaveRunConfig } from "./types";

export async function saveRunConfig(
  ctx: ApiClientFeatureContext,
  params: {
    collectionId: RQAPI.ApiClientRecord["collectionId"];
    configId: RQAPI.RunConfig["id"];
    configToSave: SaveRunConfig;
  }
) {
  const { collectionId, configId, configToSave } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.upsertRunConfig(collectionId, configId, configToSave);

  if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
    throw new NativeError("Something went wrong while saving run config!").addContext({
      collectionId,
      configId,
      configToSave,
    });
  }
}
