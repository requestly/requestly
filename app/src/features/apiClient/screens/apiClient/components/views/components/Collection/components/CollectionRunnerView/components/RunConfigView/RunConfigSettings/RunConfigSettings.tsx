import React from "react";
import { InputNumber } from "antd";
import { RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useCollectionView } from "../../../../../collectionView.context";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import {
  DEFAULT_RUN_CONFIG_ID,
  DELAY_MAX_LIMIT,
  getRunnerConfigId,
  ITERATIONS_MAX_LIMIT,
} from "features/apiClient/slices/runConfig/types";
import { toast } from "utils/Toast";
import "./runConfigSettings.scss";
import { DataFileSelector } from "./DataFileSelector";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

export const RunConfigSettings: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const { collectionId } = useCollectionView();

  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const iterations = useApiClientSelector((state) => bufferedEntity.getIterations(state));
  const delay = useApiClientSelector((state) => bufferedEntity.getDelay(state));

  const handleIterationsChange = (value: number | null) => {
    if (value === null) return;
    try {
      bufferedEntity.setIterations(value);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDelayChange = (value: number | null) => {
    if (value === null) return;
    try {
      bufferedEntity.setDelay(value);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
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

        {appMode === "DESKTOP" && (
          <div className="setting-container">
            <label htmlFor="file-upload">Select data file</label>
            <DataFileSelector />
          </div>
        )}
      </div>

      {/* TODO: for later */}
      {/* <div className="advanced-settings"></div> */}
    </div>
  );
};
