import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiClientFeatureContext } from "../contexts/meta";
import { Subscription } from "../helpers/apiClientTreeBus/subscription";
import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";
import { RQAPI } from "../types";

export const useChildren = (nodeId: string) => {
  const ctx = useApiClientFeatureContext();
  const treeBus = useMemo(() => ctx.treeBus, [ctx]);

  const getAllChildrenRecords = useCallback(
    function () {
      const children = ctx.stores.records.getState().getAllChildren(nodeId);
      const allRecords = ctx.stores.records.getState().getAllRecords();
      return allRecords.filter((r) => children.includes(r.id));
    },
    [ctx, nodeId]
  );

  const [children, setChildren] = useState<RQAPI.ApiClientRecord[]>(getAllChildrenRecords());

  useEffect(() => {
    const subscription = new Subscription<ApiClientEventTopic.TREE_CHANGED, RQAPI.ApiClientRecord[]>(
      setChildren,
      (_, ctx) => {
        const children = ctx.stores.records.getState().getAllChildren(nodeId);
        const allRecords = ctx.stores.records.getState().getAllRecords();
        const childrenRecords = allRecords.filter((r) => children.includes(r.id));
        return childrenRecords;
      }
    );
    treeBus.subscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });

    return () => {
      treeBus.unsubscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });
    };
  }, [ctx, nodeId, treeBus]);

  return children;
};
