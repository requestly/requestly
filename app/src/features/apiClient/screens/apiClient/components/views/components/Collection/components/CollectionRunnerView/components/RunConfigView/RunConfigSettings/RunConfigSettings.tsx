import React from "react";
import { InputNumber } from "antd";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useRunConfigStore } from "../../../run.context";
import { toast } from "utils/Toast";
import { DELAY_MAX_LIMIT, ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import "./runConfigSettings.scss";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { displayMultiFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";

export const RunConfigSettings: React.FC = () => {
  const [iterations, setIterations, delay, setDelay, setDataFile] = useRunConfigStore((s) => [
    s.iterations,
    s.setIterations,
    s.delay,
    s.setDelay,
    s.setDataFile,
  ]);

  const appMode = useSelector(getAppMode);

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
            <RQTooltip title={`Max limit is ${ITERATIONS_MAX_LIMIT}`}>
              <MdOutlineInfo />
            </RQTooltip>
          </label>

          <InputNumber
            min={1}
            max={ITERATIONS_MAX_LIMIT}
            value={iterations}
            size="small"
            name="run-iterations"
            onChange={handleIterationsChange}
          />
        </div>

        <div className="setting-container">
          <label htmlFor="run-delay">
            Delay
            <RQTooltip title={`Max limit is ${DELAY_MAX_LIMIT} (in ms)`}>
              <MdOutlineInfo />
            </RQTooltip>
          </label>

          <InputNumber
            min={0}
            max={DELAY_MAX_LIMIT}
            value={delay}
            size="small"
            name="run-iterations"
            onChange={handleDelayChange}
          />
        </div>

        <div className="setting-container">
          <label htmlFor="data-file">
            Data file
            <RQTooltip title={`Max limit is ${DELAY_MAX_LIMIT} (in ms)`}>
              <MdOutlineInfo />
            </RQTooltip>
          </label>

          <RQButton
            onClick={async () => {
              // Dummy code: TODO to be removed
              if (appMode === "DESKTOP") {
                displayMultiFileSelector((files) => {
                  setDataFile(files?.[0]);
                });
              }
            }}
            size="small"
          >
            Upload
          </RQButton>
        </div>
      </div>

      {/* TODO: for later */}
      {/* <div className="advanced-settings"></div> */}
    </div>
  );
};
