import { useEffect, useMemo, useState } from "react";
import { useApiClientFeatureContext } from "../contexts/meta";
import { Subscription } from "../helpers/apiClientTreeBus/subscription";
import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";
import { RQAPI } from "../types";
import { ApiClientFeatureContext } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { apiRecordsRankingManager } from "../helpers/RankingManager";
import { sortRecords } from "../screens/apiClient/utils";

export const getAllChildrenRecords = (ctx: ApiClientFeatureContext, nodeId: string) => {
  const children = ctx.stores.records.getState().getAllChildren(nodeId);
  const getRecord = ctx.stores.records.getState().getData;

  const records = children
    .map((child) => getRecord(child))
    .filter((record): record is RQAPI.ApiClientRecord => Boolean(record));

  return sortRecords(records);
};

export const getImmediateChildrenRecords = (ctx: ApiClientFeatureContext, nodeId: string) => {
  const children = ctx.stores.records.getState().getDirectChildren(nodeId);
  const getRecord = ctx.stores.records.getState().getData;
  return children.map((child) => getRecord(child)).filter((child) => !!child);
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
