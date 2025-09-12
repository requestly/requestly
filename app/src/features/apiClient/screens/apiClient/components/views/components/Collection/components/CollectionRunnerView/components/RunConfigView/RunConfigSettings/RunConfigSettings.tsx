import React, { useState } from "react";
import { InputNumber } from "antd";
import { RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import "./runConfigSettings.scss";

export const RunConfigSettings: React.FC = () => {
  const [iterations, setIterations] = useState(1);
  const [delay, setDelay] = useState(0);

  const handleIterationsChange = (value: number) => {
    // TODO: update in store
    setIterations(value);
  };

  const handleDelayChange = (value: number) => {
    // TODO: update in store
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
