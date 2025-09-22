import React from "react";
import { RunConfigViewManager } from "./components/RunConfigViewManager";
import { RQAPI } from "features/apiClient/types";
import { CollectionViewContextProvider } from "../../collectionView.context";
import Split from "react-split";
import "./collectionRunnerView.scss";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId }) => {
  return (
    <CollectionViewContextProvider collectionId={collectionId}>
      <div className="collection-runner-view">
        <Split
          gutterSize={4}
          sizes={[50, 50]}
          minSize={[400, 500]}
          direction="horizontal"
          className="collection-runner-view-split"
        >
          {/* TODO: remove extra divs after result view */}
          <div>
            <RunConfigViewManager />
          </div>

          <div>
            {/* TODO: Result view */}
            <h3>
              <i>Result view in wip...</i>
            </h3>
          </div>
        </Split>
      </div>
    </CollectionViewContextProvider>
  );
};
