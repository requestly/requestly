import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";
import { RQAPI } from "../types";
import { ApiClientFeatureContext } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { createApiClientTreeBus } from "../helpers/apiClientTreeBus/createApiClientTreeBus";

export const getAllChildrenRecords = (ctx: ApiClientFeatureContext, nodeId: string) => {
  const children = ctx.stores.records.getState().getAllChildren(nodeId);
  const getRecord = ctx.stores.records.getState().getData;
  return children.map((child) => getRecord(child)).filter(Boolean);
};

export const useChildren = createApiClientTreeBus<ApiClientEventTopic.TREE_CHANGED, RQAPI.ApiClientRecord[]>(
  ApiClientEventTopic.TREE_CHANGED,
  (ctx: ApiClientFeatureContext, nodeId: string) => {
    return getAllChildrenRecords(ctx, nodeId);
  }
);
