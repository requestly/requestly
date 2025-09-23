import React from "react";
import { InputNumber } from "antd";
import { RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useRunConfigStore } from "../../../run.context";
import { toast } from "utils/Toast";
import "./runConfigSettings.scss";

export const RunConfigSettings: React.FC = () => {
  const [iterations, setIterations, delay, setDelay] = useRunConfigStore((s) => [
    s.iterations,
    s.setIterations,
    s.delay,
    s.setDelay,
  ]);

  const handleIterationsChange = (value: number) => {
    try {
      setIterations(value);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDelayChange = (value: number) => {
    try {
      setDelay(value);
    } catch (error) {
      toast.error(error);
    }
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

      {/* TODO: for later */}
      {/* <div className="advanced-settings"></div> */}
    </div>
  );
};
