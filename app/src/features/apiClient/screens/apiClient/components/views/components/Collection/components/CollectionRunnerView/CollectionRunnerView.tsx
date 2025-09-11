import React from "react";
import { RunConfigViewManager } from "./components/RunConfigViewManager";
import { RQAPI } from "features/apiClient/types";
// import { BottomSheetLayout, BottomSheetProvider } from "componentsV2/BottomSheet";
// import { BottomSheetPlacement, SheetLayout } from "componentsV2/BottomSheet/types";
import { CollectionRunnerViewContextProvider } from "./collectionRunnerView.context";
import "./collectionRunnerView.scss";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId }) => {
  return (
    <CollectionRunnerViewContextProvider collectionId={collectionId}>
      <div className="collection-runner-view">
        {/* <BottomSheetProvider defaultPlacement={BottomSheetPlacement.RIGHT}>
        <BottomSheetLayout minSize={350} initialSizes={[50, 50]} layout={SheetLayout.SPLIT} bottomSheet={<></>}>
          <RunConfigViewManager collectionId={collectionId} />
        </BottomSheetLayout>
      </BottomSheetProvider> */}

        <RunConfigViewManager />
      </div>
    </CollectionRunnerViewContextProvider>
  );
};
