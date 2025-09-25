import React, { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { useRunResultStore } from "../../run.context";
import { RunResultContainer } from "./RunResultContainer/RunResultContainer";
import { TestsRunningLoader } from "./TestsRunningLoader/TestsRunningLoader";
import { RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import "./runResultView.scss";

export const RunResultView: React.FC = () => {
  const [result, startTime, getRunSummary, runStatus] = useRunResultStore((s) => [
    s.result,
    s.startTime,
    s.getRunSummary,
    s.runStatus,
  ]);

  const testResults = useMemo(
    () => getRunSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need `result` for reactivity
    [getRunSummary, result]
  );

  return (
    <div className="run-result-view-container">
      <div className="run-result-view-header">
        <span className="header">Result</span>
        <RQButton size="small" type="transparent" icon={<MdOutlineHistory />} onClick={() => {}}>
          History
        </RQButton>
      </div>

      <RunResultContainer result={testResults} ranAt={startTime} />
      {runStatus === RunStatus.RUNNING ? <TestsRunningLoader /> : null}
    </div>
  );
};
