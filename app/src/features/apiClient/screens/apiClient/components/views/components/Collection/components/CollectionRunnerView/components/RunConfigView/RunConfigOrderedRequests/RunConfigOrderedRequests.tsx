import React, { useCallback, useState } from "react";
import { ReorderableList } from "./ReorderableList/ReorderableList";
import { requests as requestss } from "./ReorderableList/dummy";
import { RQAPI } from "features/apiClient/types";
import { useCollectionView } from "../../../../../collectionView.context";

export const RunConfigOrderedRequests: React.FC<{ isSelectAll: boolean }> = ({ isSelectAll }) => {
  const { collectionId } = useCollectionView();
  // const [patchAndGetOrderedRequests, setRunOrder] = useRunConfig((s) => [s.patchAndGetOrderedRequests, s.setRunOrder]);
  // const children = useChildrenAPIRecords(id);
  // const orderedRequests = patchAndGetOrderedRequests(children);

  const [requests, setRequests] = useState(requestss); // FIXME: just for development

  const onOrderUpdate = useCallback(
    (rearrangedRequests: RQAPI.ApiRecord[]) => {
      // TODO: send to store
      console.log({ collectionId });
      setRequests(rearrangedRequests);
    },
    [collectionId]
  );

  return <ReorderableList isSelectAll={isSelectAll} requests={requests} onOrderUpdate={onOrderUpdate} />;
};
