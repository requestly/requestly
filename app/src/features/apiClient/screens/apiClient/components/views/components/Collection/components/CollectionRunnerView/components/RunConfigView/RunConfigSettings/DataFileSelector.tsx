import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { DataFileModalWrapper } from "../ParseFileModal/DataFileModalWrapper";
import { useDataFileModalContext } from "../ParseFileModal/DataFileModalContext";

export const DataFileSelector: React.FC = () => {
  const { parseFile } = useDataFileModalContext();

  const [dataFile, removeDataFile] = useRunConfigStore((s) => [s.dataFile, s.removeDataFile, s.setDataFile]);
  const [getFilesByIds] = useApiClientFileStore((s) => [s.getFilesByIds]);
  const file = getFilesByIds([dataFile?.id])?.[0] ?? null;
  const { openFileSelector } = useFileSelection();

  const [tempDataFileMetadata, setTempDataFileMetadata] = useState<{ name: string; path: string; size: number } | null>(
    null
  );
  const [showDataFileModal, setShowDataFileModal] = useState<boolean>(false);

  // Use a ref to track if we've initialized from dataFile
  const hasInitializedRef = useRef(false);

  // Derive dataFileMetadata: initialize from dataFile once, then use temp metadata for any new uploads
  const dataFileMetadata = useMemo(() => {
    // If we have temp metadata (from a new file selection), use that
    if (tempDataFileMetadata) {
      return tempDataFileMetadata;
    }

    // Otherwise, if dataFile exists and we haven't initialized yet, use dataFile
    if (dataFile && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return {
        name: dataFile.name,
        path: dataFile.path,
        size: dataFile.size,
      };
    }

    return null;
  }, [tempDataFileMetadata, dataFile]);

  const handleFileSelection = useCallback(() => {
    openFileSelector((file) => {
      const metadata = {
        name: file.name,
        path: file.path,
        size: file.size,
      };
      setTempDataFileMetadata(metadata);
      setShowDataFileModal(true);

      parseFile(file.path, true);
    });
  }, [openFileSelector, setTempDataFileMetadata, setShowDataFileModal, parseFile]);

  const handleModalClose = useCallback(() => {
    // If there's a dataFile and we have temp metadata that differs from it,
    // it means user cancelled a new file selection - restore the original
    if (dataFile && tempDataFileMetadata && tempDataFileMetadata.path !== dataFile.path) {
      setTempDataFileMetadata({
        name: dataFile.name,
        path: dataFile.path,
        size: dataFile.size,
      });
    }
    setShowDataFileModal(false);
  }, [dataFile, tempDataFileMetadata, setTempDataFileMetadata, setShowDataFileModal]);

  const handleViewExistingFile = useCallback(() => {
    if (dataFileMetadata) {
      setShowDataFileModal(true);
      parseFile(dataFileMetadata.path, false);
    }
  }, [dataFileMetadata, setShowDataFileModal, parseFile]);

  useEffect(() => {
    return () => {
      if (dataFile) {
        removeDataFile();
      }
    };
  }, [dataFile, removeDataFile]);

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

      {showDataFileModal && (
        <DataFileModalWrapper
          onClose={handleModalClose}
          onFileSelected={handleFileSelection}
          dataFileMetadata={dataFileMetadata}
        />
      )}
    </>
  );
};
