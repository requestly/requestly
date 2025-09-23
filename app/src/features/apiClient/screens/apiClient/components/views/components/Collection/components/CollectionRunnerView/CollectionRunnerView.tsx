import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { CollectionViewContextProvider } from "../../collectionView.context";
import Split from "react-split";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { useCommand } from "features/apiClient/commands";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { RunnerViewLoader } from "./components/RunnerViewLoader/RunnerViewLoader";
import { RunContextProvider } from "./run.context";
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import "./collectionRunnerView.scss";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId }) => {
  const {
    runner: { getDefaultRunConfig },
  } = useCommand();

  const [config, setConfig] = useState<SavedRunConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setConfig(null);
        const config = await getDefaultRunConfig({ collectionId });
        setConfig(config);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [collectionId, getDefaultRunConfig]);

  if (!config) {
    return <RunnerViewLoader />;
  }

  return (
    <AutogenerateProvider key={collectionId}>
      <CollectionViewContextProvider collectionId={collectionId}>
        <RunContextProvider runConfig={config}>
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
                <RunConfigView />
              </div>

              <div>
                {/* TODO: Result view */}
                <h3>
                  <i>Result view in wip...</i>
                </h3>
              </div>
            </Split>
          </div>
        </RunContextProvider>
      </CollectionViewContextProvider>
    </AutogenerateProvider>
  );
};
