import React from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { useRunConfigStore } from "../../../run.context";

export const RunConfigOrderedRequests: React.FC = () => {
  const [orderedRequests, setOrderedRequests] = useRunConfigStore((s) => [s.orderedRequests, s.setOrderedRequests]);
  return <ReorderableList requests={orderedRequests} onOrderUpdate={setOrderedRequests} />;
};
