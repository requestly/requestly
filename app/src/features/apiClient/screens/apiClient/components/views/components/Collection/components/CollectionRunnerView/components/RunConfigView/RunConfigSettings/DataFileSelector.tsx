import React, { useCallback, useState } from "react";
import { useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRemoveRedEye } from "@react-icons/all-files/md/MdOutlineRemoveRedEye";
import { BiError } from "@react-icons/all-files/bi/BiError";
import { getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import { RxCross2 } from "@react-icons/all-files/rx/RxCross2";
import { useRunConfigStore } from "../../../run.context";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { useFileSelection } from "../hooks/useFileSelection.hook";
import { DataFileModalWrapper } from "../ParseFileModal/Modals/DataFileModalWrapper";
import { DataFileModalViewMode, useDataFileModalContext } from "../ParseFileModal/Modals/DataFileModalContext";

export const DataFileSelector: React.FC = () => {
  const { parseFile, setFileMetadata, setViewMode } = useDataFileModalContext();

  const [dataFile, removeDataFile] = useRunConfigStore((s) => [s.dataFile, s.removeDataFile]);
  const [getFilesByIds] = useApiClientFileStore((s) => [s.getFilesByIds]);
  const file = getFilesByIds([dataFile?.id])?.[0] ?? null;
  const { openFileSelector } = useFileSelection();

  const [showModal, setShowModal] = useState<boolean>(false);

  const handleFileSelection = useCallback(() => {
    openFileSelector((file) => {
      const metadata = {
        name: file.name,
        path: file.path,
        size: file.size,
      };
      setFileMetadata(metadata);

      if (file.size > 100 * 1024 * 1024) {
        setViewMode(DataFileModalViewMode.LARGE_FILE);
        setShowModal(true);
        return;
      }
      setShowModal(true);
      parseFile(file.path, true);
    });
  }, [openFileSelector, setFileMetadata, parseFile, setViewMode]);

  const handleModalClose = useCallback(() => {
    // Clear metadata when modal closes
    setFileMetadata(null);
    setShowModal(false);
  }, [setFileMetadata, setShowModal]);

  const handleViewExistingFile = useCallback(() => {
    if (dataFile) {
      setFileMetadata({
        name: dataFile.name,
        path: dataFile.path,
        size: dataFile.size,
      });
      setShowModal(true);
      parseFile(dataFile.path, false);
    }
  }, [dataFile, setFileMetadata, setShowModal, parseFile]);

  return (
    <>
      {!dataFile ? (
        <>
          <RQButton size="small" icon={<MdOutlineFileUpload />} onClick={handleFileSelection}>
            Select file
          </RQButton>

          <div className="file-upload-info">
            <MdOutlineInfo className="file-info-icon" />
            <span className="file-type-info">Supports JSON & CSV files (max 100MB)</span>
          </div>
        </>
      ) : (
        <div className="file-uploaded-section">
          <RQButton size="small" type="secondary" className="file-uploaded-button" onClick={handleViewExistingFile}>
            {file?.isFileValid ? (
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
            <span className={`button-text ${file?.isFileValid ? "" : "file-invalid"}`}>
              {file ? truncateString(file.name, 35) + getFileExtension(file.name) : "file unavailable"}
            </span>
          </RQButton>

          {/*Clear File or Delete File */}
          <RQTooltip title={`clear file`}>
            <RQButton
              size="small"
              className="clear-file-btn"
              onClick={() => {
                removeDataFile();
              }}
              type="transparent"
            >
              {dataFile && <RxCross2 />}
            </RQButton>
          </RQTooltip>
        </div>
      )}

      {showModal && <DataFileModalWrapper onClose={handleModalClose} onFileSelected={handleFileSelection} />}
    </>
  );
};
