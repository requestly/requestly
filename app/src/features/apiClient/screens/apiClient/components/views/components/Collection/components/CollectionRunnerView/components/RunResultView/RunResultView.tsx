import React, { useMemo, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import { EmptyRunResultContainer, RunResultContainer } from "./RunResultContainer/RunResultContainer";
import { TestsRunningLoader } from "./TestsRunningLoader/TestsRunningLoader";
import { RunStatus } from "features/apiClient/slices/common/runResults/types";
import "./runResultView.scss";
import { HistoryDrawer } from "./HistoryDrawer/HistoryDrawer";
import { useCollectionView } from "../../../../collectionView.context";
import { trackCollectionRunHistoryViewed } from "modules/analytics/events/features/apiClient";
import { HistoryNotSavedBanner } from "./HistoryNotSavedBanner/HistoryNotSavedBanner";
import { RenderableError } from "errors/RenderableError";
import DefaultErrorComponent from "./errors/DefaultCollectionRunnerErrorComponent/DefaultCollectionRunnerErrorComponent";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import {
  selectLiveRunResultStartTime,
  selectLiveRunResultRunStatus,
  selectLiveRunResultError,
  selectLiveRunResultByCollectionId,
} from "features/apiClient/slices/liveRunResults/selectors";
import { selectCollectionHistoryStatus } from "features/apiClient/slices/runHistory/selectors";
import { RunHistorySaveStatus } from "features/apiClient/slices/runHistory/types";
import { useEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

interface RunResultViewProps {
  isDetailedViewOpen?: boolean;
  onToggleDetailedView?: (open: boolean) => void;
}

export const RunResultView: React.FC<RunResultViewProps> = ({ isDetailedViewOpen, onToggleDetailedView }) => {
  const { collectionId, bufferedEntity } = useCollectionView();

  const entity = useEntity({
    id: collectionId,
    type: ApiClientEntityType.COLLECTION_RECORD,
  });
  const collectionName = useApiClientSelector((s) => entity.getName(s));

  const startTime = useApiClientSelector((s) => selectLiveRunResultStartTime(s, collectionId));
  const runStatus = useApiClientSelector((s) => selectLiveRunResultRunStatus(s, collectionId));
  const historySaveStatus = useApiClientSelector((s) => selectCollectionHistoryStatus(s, collectionId));
  const error = useApiClientSelector((s) => selectLiveRunResultError(s, collectionId));

  const totalIterationCount = useApiClientSelector((state) => bufferedEntity.getIterations(state));
  const liveRunResultEntry = useApiClientSelector((s) => selectLiveRunResultByCollectionId(s, collectionId));

  const testResults = useMemo(() => {
    if (!liveRunResultEntry) {
      return;
    }

    return {
      startTime: liveRunResultEntry.startTime,
      endTime: liveRunResultEntry.endTime,
      runStatus: liveRunResultEntry.runStatus,
      iterations: liveRunResultEntry.iterations,
    };
  }, [liveRunResultEntry]);

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  return (
    <div className="run-result-view-container">
      <div className={`run-result-view-header ${isDetailedViewOpen ? "hide-border" : ""}`}>
        <div className="left-section">
          {isDetailedViewOpen && (
            <RQButton
              size="small"
              type="secondary"
              icon={<MdArrowBack />}
              onClick={() => {
                onToggleDetailedView?.(false);
              }}
            />
          )}
          <span className="header">Test results</span>
          {isDetailedViewOpen && <span className="collection-name">- {collectionName || ""}</span>}
        </div>
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

      {historySaveStatus === RunHistorySaveStatus.FAILED ? <HistoryNotSavedBanner /> : null}
      {runStatus === RunStatus.ERRORED && error ? (
        error instanceof RenderableError ? (
          error.render()
        ) : (
          <DefaultErrorComponent error={error} />
        )
      ) : !testResults ? (
        <EmptyRunResultContainer />
      ) : (
        <RunResultContainer
          result={testResults}
          ranAt={startTime ?? Date.now()}
          totalIterationCount={totalIterationCount}
          isDetailedViewOpen={isDetailedViewOpen}
          onToggleDetailedView={onToggleDetailedView}
        />
      )}
      {runStatus === RunStatus.RUNNING ? <TestsRunningLoader /> : null}
      <HistoryDrawer isHistoryDrawerOpen={isHistoryDrawerOpen} setIsHistoryDrawerOpen={setIsHistoryDrawerOpen} />
    </div>
  );
};
