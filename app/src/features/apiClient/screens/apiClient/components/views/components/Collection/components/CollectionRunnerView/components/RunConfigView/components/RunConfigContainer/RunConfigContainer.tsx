import React, { useState } from "react";
import { RunConfigOrderedRequests } from "../RunConfigOrderedRequests/RunConfigOrderedRequests";
import { Checkbox, InputNumber } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import "./runConfigContainer.scss";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";

const RunConfigSettings: React.FC = () => {
  const [iterations, setIterations] = useState(1);
  const [delay, setDelay] = useState(0);

  const handleIterationsChange = (value: number) => {
    setIterations(value);
  };

  const handleDelayChange = (value: number) => {
    setDelay(value);
  };

  return (
    <div className="run-config-settings">
      <div className="base-settings">
        <div className="setting-container">
          <label htmlFor="run-iterations">
            Iterations
            <RQTooltip>
              <MdOutlineInfo />
            </RQTooltip>
          </label>
          {/* TODO: limit TBD */}
          <InputNumber
            min={1}
            max={10}
            value={iterations}
            size="small"
            name="run-iterations"
            onChange={handleIterationsChange}
          />
        </div>

        <div className="setting-container">
          <label htmlFor="run-delay">
            Delay
            <RQTooltip>
              <MdOutlineInfo />
            </RQTooltip>
          </label>
          {/* TODO: limit TBD */}
          <InputNumber min={0} max={10} value={delay} size="small" name="run-iterations" onChange={handleDelayChange} />
        </div>
      </div>

      <div className="advanced-settings">{/* TODO: for later */}</div>
    </div>
  );
};

export const RunConfigContainer: React.FC<{}> = (props) => {
  const [selectAll, setSelectAll] = useState(true);

  const onChange = (e: CheckboxChangeEvent) => {
    setSelectAll(e.target.checked);
  };

  const handleResetClick = () => {
    // TODO
  };

  return (
    <div className="run-config-container">
      <div className="run-config-ordered-requests-header">
        <Checkbox checked={selectAll} onChange={onChange}>
          Select all
        </Checkbox>
        <RQButton type="transparent" size="small" icon={<MdOutlineRestartAlt />} onClick={handleResetClick}>
          Reset
        </RQButton>
      </div>

      <RunConfigOrderedRequests />
      <RunConfigSettings />
    </div>
  );
};
