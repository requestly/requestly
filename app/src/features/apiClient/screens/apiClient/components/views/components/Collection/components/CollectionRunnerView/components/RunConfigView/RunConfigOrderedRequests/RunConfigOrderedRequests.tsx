import React from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useRunConfigStore } from "features/apiClient/store/collectionRunConfig/runConfigStoreContext.hook";

export const RunConfigOrderedRequests: React.FC<{ selectAll: { value: boolean } }> = ({ selectAll }) => {
  const [orderedRequests, setOrderedRequests] = useRunConfigStore((s) => [s.orderedRequests, s.setOrderedRequests]);
  return <ReorderableList selectAll={selectAll} requests={orderedRequests} onOrderUpdate={setOrderedRequests} />;
};
