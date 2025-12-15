import React, { useMemo, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { useRunConfigStore, useRunResultStore } from "../../run.context";
import { RunResultContainer } from "./RunResultContainer/RunResultContainer";
import { TestsRunningLoader } from "./TestsRunningLoader/TestsRunningLoader";
import { HistorySaveStatus, RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import "./runResultView.scss";
import { HistoryDrawer } from "./HistoryDrawer/HistoryDrawer";
import { useCollectionView } from "../../../../collectionView.context";
import { trackCollectionRunHistoryViewed } from "modules/analytics/events/features/apiClient";
import { HistoryNotSavedBanner } from "./HistoryNotSavedBanner/HistoryNotSavedBanner";
import { RenderableError } from "errors/RenderableError";
import DefaultErrorComponent from "./errors/DefaultCollectionRunnerErrorComponent/DefaultCollectionRunnerErrorComponent";

export const RunResultView: React.FC = () => {
  const [iterations, startTime, getRunSummary, runStatus, historySaveStatus, error] = useRunResultStore((s) => [
    s.iterations,
    s.startTime,
    s.getRunSummary,
    s.runStatus,
    s.historySaveStatus,
    s.error,
  ]);
  const [totalIterationCount] = useRunConfigStore((s) => [s.iterations]);

  const testResults = useMemo(
    () => getRunSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need `iterations` for reactivity
    [getRunSummary, iterations]
  );

  const { collectionId } = useCollectionView();
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  return (
    <div className="run-result-view-container">
      <div className="run-result-view-header">
        <span className="header">Test results</span>
        <RQButton
          size="small"
          type="transparent"
          icon={<MdOutlineHistory />}
          onClick={() => {
            setIsHistoryDrawerOpen(true);
            trackCollectionRunHistoryViewed({
              collection_id: collectionId,
            });
          }}
        >
          History
        </RQButton>
      </div>

      {historySaveStatus === HistorySaveStatus.FAILED ? <HistoryNotSavedBanner /> : null}
      {runStatus === RunStatus.ERRORED ? (
        error instanceof RenderableError ? (
          error.render()
        ) : (
          <DefaultErrorComponent error={error} />
        )
      ) : (
        <RunResultContainer
          result={testResults}
          ranAt={startTime ?? Date.now()}
          totalIterationCount={totalIterationCount}
        />
      )}
      {runStatus === RunStatus.RUNNING ? <TestsRunningLoader /> : null}
      <HistoryDrawer isHistoryDrawerOpen={isHistoryDrawerOpen} setIsHistoryDrawerOpen={setIsHistoryDrawerOpen} />
    </div>
  );
};
