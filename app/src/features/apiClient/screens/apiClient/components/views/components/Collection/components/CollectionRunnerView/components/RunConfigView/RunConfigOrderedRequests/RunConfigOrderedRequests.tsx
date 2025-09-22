import React from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useRunConfigStore } from "features/apiClient/store/collectionRunConfig/runConfigStoreContext.hook";

export const RunConfigOrderedRequests: React.FC<{ isSelectAll: boolean }> = ({ isSelectAll }) => {
  const [orderedRequests, setOrderedRequests] = useRunConfigStore((s) => [s.orderedRequests, s.setOrderedRequests]);
  return <ReorderableList isSelectAll={isSelectAll} requests={orderedRequests} onOrderUpdate={setOrderedRequests} />;
};
