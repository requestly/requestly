import React, { useMemo } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useRunConfigStore } from "../../../run.context";
import { getOrderedApiClientRecords } from "features/apiClient/commands/store.utils";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";

export const RunConfigOrderedRequests: React.FC = () => {
  const [runOrder, setRunOrder] = useRunConfigStore((s) => [s.runOrder, s.setRunOrder]);
  const ctx = useApiClientFeatureContext();

  const orderedRequests = useMemo(() => getOrderedApiClientRecords(ctx, runOrder), [ctx, runOrder]);

  return <ReorderableList requests={orderedRequests} onOrderUpdate={setRunOrder} />;
};
