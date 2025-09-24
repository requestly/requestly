import React, { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { useRunResultStore } from "../../run.context";
import { RunResultContainer } from "./RunResultContainer/RunResultContainer";
import "./runResultView.scss";

export const RunResultView: React.FC = () => {
  const [result, startTime, getRunSummary] = useRunResultStore((s) => [s.result, s.startTime, s.getRunSummary]);
  const testResults = useMemo(() => getRunSummary(), [getRunSummary, result]);

  return (
    <div className="run-result-view-container">
      <div className="run-result-view-header">
        <span className="header">Result</span>
        <RQButton size="small" type="transparent" icon={<MdOutlineHistory />} onClick={() => {}}>
          History
        </RQButton>
      </div>

      <RunResultContainer result={testResults} ranAt={startTime} />
    </div>
  );
};
