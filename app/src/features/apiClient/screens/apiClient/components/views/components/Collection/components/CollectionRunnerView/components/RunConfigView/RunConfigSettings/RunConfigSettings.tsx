import React, { useState } from "react";
import { InputNumber } from "antd";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useRunConfigStore } from "../../../run.context";
import { toast } from "utils/Toast";
import { DELAY_MAX_LIMIT, ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import "./runConfigSettings.scss";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineRemoveRedEye } from "@react-icons/all-files/md/MdOutlineRemoveRedEye";
import { BiError } from "@react-icons/all-files/bi/BiError";
import { getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import { RxCross2 } from "@react-icons/all-files/rx/RxCross2";
import { ApiClientFile, FileId, useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { Previewmodal } from "../ParseFileModal/ParseFileModal";
import { useFileSelection } from "../hooks/useFileSelection.hook";

const UploadedFileView: React.FC<{
  dataFile: Omit<ApiClientFile, "isFileValid"> & { id: FileId };
  setShowPreviewModal: React.Dispatch<React.SetStateAction<boolean>>;
  file: ApiClientFile;
}> = ({ dataFile, setShowPreviewModal, file }) => {
  return (
    <>
      <div className="file-uploaded-section">
        {/* File uploaded view button sectipon */}
        <RQButton
          size="small"
          type="secondary"
          className="file-uploaded-button"
          onClick={() => {
            setShowPreviewModal(true);
          }}
        >
          {file.isFileValid ? (
            <MdOutlineRemoveRedEye className="eye-icon" />
          ) : (
            <>
              <RQTooltip
                title={"The file you selected is not available. Please remove and upload a new file to continue."}
                placement="top"
              >
                <BiError className="invalid-icon" />
              </RQTooltip>
            </>
          )}
          {/*needs to be fixed according to design */}
          <span className={`button-text ${file.isFileValid ? "" : "file-invalid"}`}>
            {truncateString(dataFile.name, 35) + getFileExtension(dataFile.name)}
          </span>
        </RQButton>

        {/*Clear File or Delete File */}
        <RQTooltip title={`clear file`}>
          <RQButton
            size="small"
            className="clear-file-btn"
            onClick={() => {
              /**
                use clear file method from store
              */
            }}
            type="transparent"
          >
            {dataFile && <RxCross2 />}
          </RQButton>
        </RQTooltip>
      </div>
    </>
  );
};

const SelectFileToUpload: React.FC<{
  handleSelectFile: () => void;
}> = ({ handleSelectFile }) => {
  return (
    <>
      <RQButton
        size="small"
        icon={<MdOutlineFileUpload />}
        onClick={() => {
          handleSelectFile();
        }}
      >
        Select file
      </RQButton>

      <div className="file-upload-info">
        <MdOutlineInfo className="file-info-icon" />
        <span className="file-type-info">Supported file type: JSON & CSV</span>
      </div>
    </>
  );
};

export const RunConfigSettings: React.FC = () => {
  const [iterations, setIterations, delay, setDelay, dataFile] = useRunConfigStore((s) => [
    s.iterations,
    s.setIterations,
    s.delay,
    s.setDelay,
    s.dataFile,
  ]);

  const { openFileSelector } = useFileSelection();
  const [getFilesByIds] = useApiClientFileStore((s) => [s.getFilesByIds]);

  const [file] = getFilesByIds([dataFile?.id]);

  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
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

  const handleSelectFile = () => {
    openFileSelector(() => {
      setShowPreviewModal(true);
    });
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
          <label htmlFor="file-upload">Select data file</label>

          {/* File uploading button section */}
          {!dataFile ? (
            <SelectFileToUpload handleSelectFile={handleSelectFile} />
          ) : (
            <>
              <UploadedFileView dataFile={dataFile} setShowPreviewModal={setShowPreviewModal} file={file} />
            </>
          )}

          {/* added here just for testing */}
          {showPreviewModal && (
            <Previewmodal
              status={"success"}
              count={1001}
              onClose={() => setShowPreviewModal(false)}
              onFileSelected={() => setShowPreviewModal(true)}
            />
          )}
        </div>
      </div>

      {/* TODO: for later */}
      {/* <div className="advanced-settings"></div> */}
    </div>
  );
};
