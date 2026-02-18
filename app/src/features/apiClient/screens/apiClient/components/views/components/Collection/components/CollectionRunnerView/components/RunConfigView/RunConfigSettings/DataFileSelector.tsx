import { BiError } from "@react-icons/all-files/bi/BiError";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { MdOutlineRemoveRedEye } from "@react-icons/all-files/md/MdOutlineRemoveRedEye";
import { RxCross2 } from "@react-icons/all-files/rx/RxCross2";
import { getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import {
  trackCollectionRunnerFileCleared,
  trackCollectionRunnerSelectFileClicked,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback, useMemo } from "react";
import { useCollectionView } from "../../../../../collectionView.context";
import { useCollectionRunnerFileSelection } from "../hooks/useCollectionRunnerFileSelection.hook";
import { DataFileModalViewMode, useDataFileModalContext } from "../ParseFileModal/Modals/DataFileModalContext";
import { DataFileModalWrapper } from "../ParseFileModal/Modals/DataFileModalWrapper";

export const DataFileSelector: React.FC = () => {
  const {
    parseFile,
    setDataFileMetadata,
    setViewMode,
    dataFileMetadata,
    showModal,
    setShowModal,
  } = useDataFileModalContext();

  const { bufferedEntity } = useCollectionView();

  const dataFile = useApiClientSelector((state) => bufferedEntity.getDataFile(state));

  const [getFilesByIds, isFilePresentLocally, storeFiles] = useApiClientFileStore((s) => [
    s.getFilesByIds,
    s.isFilePresentLocally,
    s.files,
  ]);

  const file = useMemo(
    () => {
      if (!dataFile) {
        return null;
      }

      return getFilesByIds([dataFile?.id])?.[0] ?? null;
    },

    // Need storeFiles to check trigger rerender
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataFile?.id, getFilesByIds, storeFiles]
  );

  const { openFileSelector } = useCollectionRunnerFileSelection();

  const handleFileSelection = useCallback(() => {
    trackCollectionRunnerSelectFileClicked();
    openFileSelector();
  }, [openFileSelector]);

  const handleModalClose = useCallback(() => {
    // Clear metadata when modal closes
    setDataFileMetadata(null);
    setShowModal(false);
  }, [setDataFileMetadata, setShowModal]);

  const handleRemoveFile = useCallback(() => {
    setDataFileMetadata(null);
    bufferedEntity.removeDataFile();
    bufferedEntity.setIterations(1);
  }, [bufferedEntity, setDataFileMetadata]);

  const handleViewExistingFile = useCallback(async () => {
    if (dataFile && file) {
      const isFilePresent = await isFilePresentLocally(dataFile.id);
      if (!isFilePresent) {
        // setting view mode to rerender and show error state through isValud
        setViewMode(DataFileModalViewMode.ERROR);
        return;
      }

      setDataFileMetadata({
        name: dataFile.name,
        path: dataFile.path,
        size: dataFile.size,
      });
      setShowModal(true);
      parseFile(dataFile.path, false);
    }
  }, [dataFile, file, isFilePresentLocally, setDataFileMetadata, setShowModal, parseFile, setViewMode]);

  return (
    <>
      {!dataFile || !file ? (
        <>
          <RQButton
            size="small"
            icon={<MdOutlineFileUpload />}
            onClick={() => {
              handleFileSelection();
            }}
          >
            Select file
          </RQButton>

          <div className="file-upload-info">
            <MdOutlineInfo className="file-info-icon" />
            <span className="file-type-info">Supports JSON & CSV files (max 100MB)</span>
          </div>
        </>
      ) : (
        <div className="file-uploaded-section">
          {!file?.isFileValid ? (
            <RQTooltip
              title={"The file you selected is not available. Please remove and upload a new file to continue."}
              placement="top"
            >
              <RQButton size="small" type="secondary" className="file-uploaded-button" onClick={handleViewExistingFile}>
                <BiError className="invalid-icon" />
                <span className={`button-text file-invalid`}>
                  {file ? truncateString(file.name, 35) + getFileExtension(file.name) : "file unavailable"}
                </span>
              </RQButton>
            </RQTooltip>
          ) : (
            <RQButton size="small" type="secondary" className="file-uploaded-button" onClick={handleViewExistingFile}>
              <MdOutlineRemoveRedEye className="eye-icon" />
              <span className={`button-text`}>{truncateString(file.name, 35) + getFileExtension(file.name)}</span>
            </RQButton>
          )}

          {/*Clear File or Delete File */}
          <RQTooltip title={`clear file`}>
            <RQButton
              size="small"
              className="clear-file-btn"
              onClick={() => {
                handleRemoveFile();
                trackCollectionRunnerFileCleared();
              }}
              type="transparent"
            >
              {dataFile && file && <RxCross2 />}
            </RQButton>
          </RQTooltip>
        </div>
      )}

      {showModal && dataFileMetadata && (
        <DataFileModalWrapper onClose={handleModalClose} onFileSelected={handleFileSelection} />
      )}
    </>
  );
};
