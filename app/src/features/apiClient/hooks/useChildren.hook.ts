import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";
import { RQAPI } from "../types";
import { ApiClientFeatureContext } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { createApiClientTreeBus } from "../helpers/apiClientTreeBus/createApiClientTreeBus";

export const getAllChildrenRecords = (ctx: ApiClientFeatureContext, nodeId: string) => {
  const children = ctx.stores.records.getState().getAllChildren(nodeId);
  const getRecord = ctx.stores.records.getState().getData;
  return children.map((child) => getRecord(child)).filter(Boolean).sort(
    (recordA, recordB) => {
      // If different type, then keep collection first
      if (recordA.type === RQAPI.RecordType.COLLECTION && recordA.isExample && !recordB.isExample) {
        return -1;
      }

      if (recordB.type === RQAPI.RecordType.COLLECTION && recordB.isExample && !recordA.isExample) {
        return 1;
      }

      if (recordA.type !== recordB.type) {
        return recordA.type === RQAPI.RecordType.COLLECTION ? -1 : 1;
      }

      // If types are the same, sort lexicographically by name
      if (recordA.name.toLowerCase() !== recordB.name.toLowerCase()) {
        return recordA.name.toLowerCase() < recordB.name.toLowerCase() ? -1 : 1;
      }

      // If names are the same, sort by creation date
      return recordA.createdTs - recordB.createdTs;
    }
  );
};

export const useChildren = createApiClientTreeBus<ApiClientEventTopic.TREE_CHANGED, RQAPI.ApiClientRecord[]>(
  ApiClientEventTopic.TREE_CHANGED,
  (ctx: ApiClientFeatureContext, nodeId: string) => {
    return getAllChildrenRecords(ctx, nodeId);
  }
);
