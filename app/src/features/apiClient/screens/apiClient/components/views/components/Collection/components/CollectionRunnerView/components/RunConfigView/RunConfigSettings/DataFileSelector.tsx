import { BiError } from "@react-icons/all-files/bi/BiError";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { MdOutlineRemoveRedEye } from "@react-icons/all-files/md/MdOutlineRemoveRedEye";
import { RxCross2 } from "@react-icons/all-files/rx/RxCross2";
import { API_CLIENT_DOCS } from "features/apiClient/constants";
import { getFileExtension, truncateString } from "features/apiClient/screens/apiClient/utils";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useApiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import {
  trackCollectionRunnerFileCleared,
  trackCollectionRunnerSelectFileClicked,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback, useMemo } from "react";
import { isDesktopMode } from "utils/AppUtils";
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

  const isDesktop = useMemo(isDesktopMode, []);

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
    if (file) {
      const isFilePresent = await isFilePresentLocally(file.id);
      if (!isFilePresent) {
        // setting view mode to rerender and show error state through isValud
        setViewMode(DataFileModalViewMode.ERROR);
        return;
      }

      setDataFileMetadata({
        name: file.name,
        path: file.path,
        size: file.size,
      });
      setShowModal(true);
      parseFile(file.path, false);
    }
  }, [file, isFilePresentLocally, setDataFileMetadata, setShowModal, parseFile, setViewMode]);

  const selectFileButton = (
    <RQButton
      size="small"
      icon={<MdOutlineFileUpload />}
      disabled={!isDesktop}
      onClick={() => {
        handleFileSelection();
      }}
    >
      Select file
    </RQButton>
  );

  return (
    <>
      {!file ? (
        <>
          {isDesktop ? (
            selectFileButton
          ) : (
            <RQTooltip
              title={
                <>
                  This feature is only available in Desktop App.{" "}
                  <a
                    href={API_CLIENT_DOCS.COLLECTION_RUNNER_DATA_FILE}
                    target="_blank"
                    rel="noreferrer"
                    className="tooltip-link"
                  >
                    Learn more
                  </a>
                </>
              }
              placement="top"
            >
              <span>{selectFileButton}</span>
            </RQTooltip>
          )}

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
              {file && <RxCross2 />}
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
