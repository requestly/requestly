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
      const getRecord = ctx.stores.records.getState().getData;
      return children.map((child) => getRecord(child)).filter(Boolean);
    },
    [ctx, nodeId]
  );

  const [children, setChildren] = useState<RQAPI.ApiClientRecord[]>(getAllChildrenRecords());

  useEffect(() => {
    const subscription = new Subscription<ApiClientEventTopic.TREE_CHANGED, RQAPI.ApiClientRecord[]>(
      setChildren,
      (_, ctx) => {
        return getAllChildrenRecords();
      }
    );
    treeBus.subscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });

    return () => {
      treeBus.unsubscribe({ nodeId: nodeId, topic: ApiClientEventTopic.TREE_CHANGED, subscription });
    };
  }, [getAllChildrenRecords, nodeId, treeBus]);

  return children;
};
