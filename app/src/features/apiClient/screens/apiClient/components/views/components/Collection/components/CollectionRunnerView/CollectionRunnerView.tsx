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
import { RunConfigView } from "./components/RunConfigView/RunConfigView";
import { RunViewContextProvider } from "./run.context";
import { RunResultView } from "./components/RunResultView/RunResultView";
import "./collectionRunnerView.scss";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { DataFileModalProvider } from "./components/RunConfigView/ParseFileModal/Modals/DataFileModalContext";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const CollectionRunnerView: React.FC<Props> = ({ collectionId }) => {
  const {
    runner: { getDefaultRunConfig, getRunResults },
  } = useCommand();

  const [config, setConfig] = useState<SavedRunConfig | null>(null);
  const [runResults, setRunResults] = useState<RunResult[] | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        setRunResults(null);
        const results = await getRunResults({ collectionId });
        setRunResults(results);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [collectionId, getRunResults]);

  if (!config || !runResults) {
    return <RunnerViewLoader />;
  }

  return (
    <CollectionViewContextProvider key={collectionId} collectionId={collectionId}>
      <AutogenerateProvider>
        <RunViewContextProvider runConfig={config} history={runResults}>
          <div className="collection-runner-view">
            <Split
              gutterSize={4}
              sizes={[50, 50]}
              minSize={[400, 500]}
              direction="horizontal"
              className="collection-runner-view-split"
            >
              <DataFileModalProvider>
                <RunConfigView />
                <RunResultView />
              </DataFileModalProvider>
            </Split>
          </div>
        </RunViewContextProvider>
      </AutogenerateProvider>
    </CollectionViewContextProvider>
  );
};
