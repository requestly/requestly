import { useEffect, useMemo, useState } from "react";
import { useApiClientFeatureContext } from "../../contexts/meta";
import { Subscription } from "./subscription";
import { ApiClientEventTopic } from "./types";

export const createApiClientTreeBus = <K extends ApiClientEventTopic, TData>(
  topic: K,
  dataFetcher: (ctx: any, ...args: any[]) => TData
) => {
  return (...args: any[]): TData => {
    const ctx = useApiClientFeatureContext();
    const treeBus = useMemo(() => ctx.treeBus, [ctx]);
    const [data, setData] = useState<TData>(() => dataFetcher(ctx, ...args));
    const nodeId = args[0] as string;

    useEffect(() => {
      const subscription = new Subscription<K, TData>(setData, () => dataFetcher(ctx, ...args));
      treeBus.subscribe({ nodeId, topic, subscription });

      return () => {
        treeBus.unsubscribe({ nodeId, topic, subscription });
      };
    }, [args, ctx, nodeId, treeBus]);

    return data;
  };
};
