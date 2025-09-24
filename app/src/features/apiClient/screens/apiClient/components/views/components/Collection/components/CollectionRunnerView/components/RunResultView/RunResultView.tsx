import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { useRunResultStore } from "../../run.context";
import { RunResult } from "./RunResult/RunResult";
import "./runResultView.scss";

export const RunResultView: React.FC = () => {
  const [result, startTime] = useRunResultStore((s) => [s.result, s.startTime, s.getRunSummary]);

  return (
    <div className="run-result-view-container">
      <div className="run-result-view-header">
        <span className="header">Result</span>
        <RQButton size="small" type="transparent" icon={<MdOutlineHistory />} onClick={() => {}}>
          History
        </RQButton>
      </div>

      <RunResult testResults={result} ranAt={startTime} />
    </div>
  );
};
