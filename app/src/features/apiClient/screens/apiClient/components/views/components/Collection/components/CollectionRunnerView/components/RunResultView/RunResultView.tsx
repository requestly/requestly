import React, { useMemo, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { RunResultContainer } from "./RunResultContainer/RunResultContainer";
import { TestsRunningLoader } from "./TestsRunningLoader/TestsRunningLoader";
import { HistorySaveStatus, RunStatus } from "features/apiClient/slices/common/runResults/types";
import "./runResultView.scss";
import { HistoryDrawer } from "./HistoryDrawer/HistoryDrawer";
import { useCollectionView } from "../../../../collectionView.context";
import { trackCollectionRunHistoryViewed } from "modules/analytics/events/features/apiClient";
import { HistoryNotSavedBanner } from "./HistoryNotSavedBanner/HistoryNotSavedBanner";
import { RenderableError } from "errors/RenderableError";
import DefaultErrorComponent from "./errors/DefaultCollectionRunnerErrorComponent/DefaultCollectionRunnerErrorComponent";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectHistorySaveStatus } from "features/apiClient/slices/runHistory";
import {
  selectLiveRunResultIterations,
  selectLiveRunResultStartTime,
  selectLiveRunResultRunStatus,
  selectLiveRunResultError,
  selectLiveRunResultByCollectionId,
} from "features/apiClient/slices/liveRunResults/selectors";

export const RunResultView: React.FC = () => {
  const { collectionId, bufferedEntity } = useCollectionView();

  const liveRunResultEntry = useApiClientSelector((s) => selectLiveRunResultByCollectionId(s, collectionId));
  const runSummary = useMemo(() => {
    if (!liveRunResultEntry) {
      // Return empty run summary when no entry exists
      return {
        startTime: null,
        endTime: null,
        runStatus: RunStatus.IDLE,
        iterations: new Map(),
      };
    }

    return {
      startTime: liveRunResultEntry.startTime,
      endTime: liveRunResultEntry.endTime,
      runStatus: liveRunResultEntry.runStatus,
      iterations: liveRunResultEntry.iterations,
    };
  }, [liveRunResultEntry]);

  const iterationsMap = useApiClientSelector((s) => selectLiveRunResultIterations(s, collectionId));
  const iterations = iterationsMap?.size ?? 0;
  const startTime = useApiClientSelector((s) => selectLiveRunResultStartTime(s, collectionId));
  const runStatus = useApiClientSelector((s) => selectLiveRunResultRunStatus(s, collectionId));
  const historySaveStatus = useApiClientSelector((s) => selectHistorySaveStatus(s));
  const error = useApiClientSelector((s) => selectLiveRunResultError(s, collectionId));

  const totalIterationCount = useApiClientSelector((state) => bufferedEntity.getIterations(state));

  const testResults = useMemo(
    () => runSummary,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need `iterations` for reactivity
    [runSummary, iterations]
  );

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
      {runStatus === RunStatus.ERRORED && error ? (
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
