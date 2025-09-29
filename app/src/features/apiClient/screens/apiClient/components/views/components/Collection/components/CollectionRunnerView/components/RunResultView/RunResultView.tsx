import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { useRunContext, useRunResultStore } from "../../run.context";
import { RunResultContainer } from "./RunResultContainer/RunResultContainer";
import { TestsRunningLoader } from "./TestsRunningLoader/TestsRunningLoader";
import { RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import { HistoryDrawer } from "./HistoryDrawer/HistoryDrawer";
import { unstable_useBlocker, Location } from "react-router-dom";
import { useGenericState } from "hooks/useGenericState";
import { RQModal } from "lib/design-system/components";
import { useCommand } from "features/apiClient/commands";
import "./runResultView.scss";

export const RunResultView: React.FC = () => {
  const runContext = useRunContext();
  const {
    runner: { cancelRun },
  } = useCommand();

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState<
    | {
        value: false;
        source: null;
      }
    | {
        value: true;
        source: "in_app_navigation" | "tab_close";
      }
  >({ value: false, source: null });

  const { setBeforeClose, close } = useGenericState();
  const [iterations, startTime, getRunSummary, runStatus] = useRunResultStore((s) => [
    s.iterations,
    s.startTime,
    s.getRunSummary,
    s.runStatus,
  ]);

  const testResults = useMemo(
    () => getRunSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need `interations` for reactivity
    [getRunSummary, iterations]
  );

  const isRunning = runStatus === RunStatus.RUNNING;
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const unloadListener = (e: any) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };

    setBeforeClose(() => {
      setShowCloseConfirmation({ value: true, source: "tab_close" });
      return isRunning;
    });

    window.addEventListener("beforeunload", unloadListener);

    return () => {
      setBeforeClose(null);
      setShowCloseConfirmation({ value: false, source: null });
      window.removeEventListener("beforeunload", unloadListener);
    };
  }, [isRunning, setBeforeClose]);

  const blockerCallback: Parameters<typeof unstable_useBlocker>[0] = useCallback(
    ({ nextLocation }: { nextLocation: Location }) => {
      const isNextNavigationInApiClientView = nextLocation.pathname.startsWith("/api-client");
      const shouldBlock = !isNextNavigationInApiClientView && isRunning;

      if (shouldBlock) {
        setShowCloseConfirmation({ value: true, source: "in_app_navigation" });
        return true; // block navigation
      }

      return false;
    },
    [isRunning]
  );

  // In app navigation blocking
  unstable_useBlocker(blockerCallback);

  const handleCloseModal = useCallback(() => {
    setShowCloseConfirmation({ value: false, source: null });
  }, []);

  const handleStopAndLeave = useCallback(() => {
    cancelRun({ runContext });
    setShowCloseConfirmation({ value: false, source: null });

    if (showCloseConfirmation.source === "tab_close") {
      close();
    }
  }, [cancelRun, close, runContext, showCloseConfirmation]);

  return (
    <>
      {showCloseConfirmation ? (
        <RQModal
          width={480}
          destroyOnClose
          open={showCloseConfirmation.value}
          maskStyle={{ background: "rgba(0, 0, 0, 0.7)" }}
          className="close-running-tab-confirmation-modal"
          onCancel={handleCloseModal}
        >
          <div className="modal-content">
            <div className="header">Collection run is in progress</div>
            <div className="description">
              Your collection is currently running. Leaving will stop the execution and you won't get results for the
              remaining requests.
            </div>
            <div className="actions">
              <RQButton onClick={handleCloseModal}>Continue running</RQButton>
              <RQButton onClick={handleStopAndLeave} type="danger">
                Stop and leave
              </RQButton>
            </div>
          </div>
        </RQModal>
      ) : null}

      <div className="run-result-view-container">
        <div className="run-result-view-header">
          <span className="header">Result</span>
          <RQButton
            size="small"
            type="transparent"
            icon={<MdOutlineHistory />}
            onClick={() => {
              setIsHistoryDrawerOpen(true);
            }}
          >
            History
          </RQButton>
        </div>

        <RunResultContainer result={testResults} ranAt={startTime} />
        {isRunning ? <TestsRunningLoader /> : null}
        <HistoryDrawer isHistoryDrawerOpen={isHistoryDrawerOpen} setIsHistoryDrawerOpen={setIsHistoryDrawerOpen} />
      </div>
    </>
  );
};
