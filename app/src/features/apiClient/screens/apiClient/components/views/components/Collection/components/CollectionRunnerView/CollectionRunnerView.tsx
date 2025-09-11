import React from "react";
import { RunConfigViewManager } from "./components/RunConfigViewManager";
import { RQAPI } from "features/apiClient/types";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId }) => {
  return (
    <div className="collection-runner-view">
      {/* TODO: should be resizable */}
      <RunConfigViewManager collectionId={collectionId} />
      {/* RunResults will be here */}
    </div>
  );
};
