import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getAllChildren } from "features/apiClient/store/apiRecords/apiRecords.store";
import { RQAPI } from "features/apiClient/types";
import { getChildParentMap } from "../store.utils";
import { RunConfigState } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import { NativeError } from "errors/NativeError";

function getDefaultRunOrderByCollectionId(
  ctx: ApiClientFeatureContext,
  id: RQAPI.ApiClientRecord["collectionId"]
): RunConfigState["runOrder"] {
  const childParentMap = getChildParentMap(ctx);
  const runOrder = getAllChildren(id, childParentMap);
  return runOrder;
}

export type FetchedRunConfig = Pick<RQAPI.RunConfig, "id" | "runOrder">;

function getConfigFromSavedData(config: Partial<RQAPI.RunConfig>): FetchedRunConfig {
  return { id: config.id, runOrder: config.runOrder };
}

export async function fetchOrCreateDefaultRunConfig(
  ctx: ApiClientFeatureContext,
  params: { collectionId: RQAPI.ApiClientRecord["collectionId"] }
): Promise<FetchedRunConfig> {
  const DEFAULT_RUN_CONFIG_ID = "default"; // In future configId will be provided

  const { collectionId } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.getRunConfig(collectionId, DEFAULT_RUN_CONFIG_ID);

  if (result.success) {
    return getConfigFromSavedData(result.data);
  }

  // create deafult config
  const defaultConfig: Partial<RQAPI.RunConfig> = {
    id: DEFAULT_RUN_CONFIG_ID,
    runOrder: getDefaultRunOrderByCollectionId(ctx, collectionId),
  };

  const upsertResult = await apiClientRecordsRepository.upsertRunConfig(collectionId, defaultConfig);

  if (!upsertResult.success) {
    throw new NativeError("Something went wrong while fetching run config!").addContext({ upsertResult });
  }

  return getConfigFromSavedData(upsertResult.data);
}
