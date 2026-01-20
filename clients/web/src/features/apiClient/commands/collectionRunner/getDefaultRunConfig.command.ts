import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getAllChildren } from "features/apiClient/store/apiRecords/apiRecords.store";
import { RQAPI } from "features/apiClient/types";
import { getChildParentMap } from "../store.utils";
import { NativeError } from "errors/NativeError";
import { SavedRunConfig } from "./types";

function getDefaultRunOrderByCollectionId(
  ctx: ApiClientFeatureContext,
  id: RQAPI.ApiClientRecord["collectionId"]
): RQAPI.RunOrder {
  const childParentMap = getChildParentMap(ctx);
  const runOrder = getAllChildren(id, childParentMap).map((id) => ({ id: id, isSelected: true }));
  return runOrder;
}

function getConfigFromSavedData(config: SavedRunConfig): SavedRunConfig {
  return {
    ...config,
  };
}

export async function getDefaultRunConfig(
  ctx: ApiClientFeatureContext,
  params: { collectionId: RQAPI.ApiClientRecord["collectionId"] }
): Promise<SavedRunConfig> {
  const DEFAULT_RUN_CONFIG_ID = "default"; // In future configId will be provided

  const { collectionId } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.getRunConfig(collectionId, DEFAULT_RUN_CONFIG_ID);

  if (result.success) {
    return getConfigFromSavedData(result.data);
  }

  if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
    throw new NativeError("Something went wrong while fetching run config!").addContext({ collectionId });
  }

  const defaultConfig: SavedRunConfig = {
    id: DEFAULT_RUN_CONFIG_ID,
    runOrder: getDefaultRunOrderByCollectionId(ctx, collectionId),
    delay: 0,
    iterations: 1,
    dataFile: null,
  };

  return defaultConfig;
}
