import React from "react";
import { InputNumber } from "antd";
import { RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useRunConfigStore } from "../../../run.context";
import { toast } from "utils/Toast";
import { DELAY_MAX_LIMIT, ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import "./runConfigSettings.scss";
import { DataFileUploadView } from "./DataFileUploadView";

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

  // Stub: This function will parse the file and return status
  // const parseFile = async (fileInfo: {
  //   name: string;
  //   path: string;
  //   size: number;
  // }): Promise<{ status: "success" | "error"; count?: number }> => {
  //   // TODO: Implement actual file parsing logic
  //   // This should:
  //   // 1. Read the file content
  //   // 2. Parse JSON/CSV
  //   // 3. Validate structure
  //   // 4. Count rows
  //   // 5. Return status and count

  //   return new Promise((resolve) => {
  //     // Simulating parsing delay
  //     setTimeout(() => {
  //       // Mock response - replace with actual parsing logic
  //       resolve({
  //         status: "success",
  //         count: 850, // Mock count
  //       });
  //     }, 2000);
  //   });
  // };

  // const handleSelectFile = () => {
  //   openFileSelector(async (file) => {
  //     if (file.size > 100 * 1024 * 1024) {
  //       setModalContext("largeFile");
  //       setShowDataFileModal(true);
  //     } else {
  //       //show loading modal
  //       setModalContext("loading");
  //       setShowDataFileModal(true);

  //       //parsing stub
  //       const parseResult = await parseFile(file);
  //       if (parseResult.status === "success") {
  //         setFileRowsCount(parseResult.count);
  //         setModalContext("success");
  //       } else {
  //         setModalContext("error");
  //       }
  //     }
  //   });
  // };

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
          <label htmlFor="file-upload">Select data file</label>
          <DataFileUploadView />
        </div>
      </div>

      {/* TODO: for later */}
      {/* <div className="advanced-settings"></div> */}
    </div>
  );
};
