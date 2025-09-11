import React from "react";
import { ReOrderableList } from "./ReOrderableList/ReOrderableList";
import { useCollectionRunnerView } from "../../../../collectionRunnerView.context";

export const RunConfigOrderedRequests: React.FC<{}> = (props) => {
  const { collectionId } = useCollectionRunnerView();
  // const [patchAndGetOrderedRequests, setRunOrder] = useRunConfig((s) => [s.patchAndGetOrderedRequests, s.setRunOrder]);
  // const children = useChildrenAPIRecords(id);
  // const orderedRequests = patchAndGetOrderedRequests(children);

  console.log({ collectionId });

  return (
    <>
      {/* @ts-ignore */}
      <ReOrderableList list={[]} onOrderUpdate={(updatedOrder: string[]) => {}} />
    </>
  );
};
