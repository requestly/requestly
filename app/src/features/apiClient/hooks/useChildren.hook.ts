import { useEffect, useMemo, useState } from "react";
import { useApiClientFeatureContext } from "../contexts/meta";
import { Subscription } from "../helpers/apiClientTreeBus/subscription";
import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";
import { RQAPI } from "../types";
import { ApiClientFeatureContext } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { apiRecordsRankingManager } from "../components/sidebar";

export const getAllChildrenRecords = (ctx: ApiClientFeatureContext, nodeId: string) => {
  const children = ctx.stores.records.getState().getAllChildren(nodeId);
  const getRecord = ctx.stores.records.getState().getData;
  return children
    .map((child) => getRecord(child))
    .filter((record): record is RQAPI.ApiClientRecord => Boolean(record))
    .sort((recordA, recordB) => {
      // Keep example collections first
      if (recordA.isExample && !recordB.isExample) {
        return -1;
      }
      if (recordB.isExample && !recordA.isExample) {
        return 1;
      }

      // If different type, then keep collection first
      if (recordA.type !== recordB.type) {
        return recordA.type === RQAPI.RecordType.COLLECTION ? -1 : 1;
      }

      // For same type, use ranking manager to sort by rank
      const aRank = apiRecordsRankingManager.getEffectiveRank(recordA);
      const bRank = apiRecordsRankingManager.getEffectiveRank(recordB);
      return apiRecordsRankingManager.compareFn(aRank, bRank);
    });
};

export const useChildren = (nodeId: string) => {
  const ctx = useApiClientFeatureContext();
  const treeBus = useMemo(() => ctx.treeBus, [ctx]);

  const [children, setChildren] = useState<RQAPI.ApiClientRecord[]>(getAllChildrenRecords(ctx, nodeId));

  useEffect(() => {
    const subscription = new Subscription<ApiClientEventTopic.TREE_CHANGED, RQAPI.ApiClientRecord[]>(
      setChildren,
      () => {
        return getAllChildrenRecords(ctx, nodeId);
      }
    );
    treeBus.subscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });

    return () => {
      treeBus.unsubscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });
    };
  }, [ctx, nodeId, treeBus]);

  return children;
};
