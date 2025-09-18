import { useEffect, useMemo, useState } from "react";
import { useApiClientFeatureContext } from "../contexts/meta";
import { Subscription } from "../helpers/apiClientTreeBus/subscription";
import { ApiClientEventTopic } from "../helpers/apiClientTreeBus/types";

export const useChildren = (id: string) => {
  const ctx = useApiClientFeatureContext();
  const treeBus = useMemo(() => ctx.treeBus, [ctx]);

  const [children, setChildren] = useState(ctx.stores.records.getState().getAllChildren(id));

  useEffect(() => {
    const subscription = new Subscription<ApiClientEventTopic.CHILD_ADDED, string[]>(setChildren, (ChildAdded, ctx) =>
      ctx.stores.records.getState().getAllChildren(id)
    );
    treeBus.subscribe({ nodeId: id, topic: ApiClientEventTopic.CHILD_ADDED, subscription });

    return () => {
      treeBus.unsubscribe({ nodeId: id, topic: ApiClientEventTopic.CHILD_ADDED, subscription });
    };
  }, [ctx, id, treeBus]);

  return children;
};
