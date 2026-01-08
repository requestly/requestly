import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { API_CLIENT_DOCS } from "features/apiClient/constants";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { DEFAULT_RUN_CONFIG_ID, getRunnerConfigId } from "features/apiClient/slices/runConfig/types";
import { FileFeature } from "features/apiClient/store/apiClientFilesStore";
import { RQButton } from "lib/design-system-v2/components";
import { RQModal } from "lib/design-system/components";
import {
  trackCollectionRunnerFileCleared,
  trackCollectionRunnerTruncatedFileUsed,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback } from "react";
import { useCollectionView } from "../../../../../../collectionView.context";
import { DataFileModalViewMode, useDataFileModalContext } from "./DataFileModalContext";
import "./dataFileModalWrapper.scss";
import { DataFileView } from "./DataFileView";
import { ErroredStateView } from "./ErroredStateView";
import { LargeFileView } from "./LargeFileView";
import { LoadingView } from "./LoadingView";
import { WarningView } from "./WarningView";

interface buttonSchema {
  label: string;
  onClick: () => void;
}

interface buttonTypes {
  primaryButton: buttonSchema;
  secondaryButton: buttonSchema;
}

export interface ModalProps {
  buttonOptions: () => buttonTypes;
  viewMode?: DataFileModalViewMode;
}

export const FooterButtons: React.FC<{
  buttonOptions: () => buttonTypes;
  primaryIcon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
}> = ({ buttonOptions, primaryIcon, secondaryIcon }) => {
  return (
    <div className="preview-modal-footer-container">
      <RQButton type="secondary" onClick={buttonOptions().secondaryButton.onClick} icon={secondaryIcon ?? null}>
        {buttonOptions().secondaryButton.label}
      </RQButton>
      <RQButton type="primary" onClick={buttonOptions().primaryButton.onClick} icon={primaryIcon ?? null}>
        {buttonOptions().primaryButton.label}
      </RQButton>
    </div>
  );
};

export const ModalHeader: React.FC<{ dataFileMetadata: { name: string; path: string; size: number } }> = ({
  dataFileMetadata,
}) => {
  return (
    <div className="preview-modal-header-container">
      {dataFileMetadata?.name ? (
        <div className="preview-modal-title">Preview: {dataFileMetadata.name}</div>
      ) : (
        <div className="preview-modal-title">Preview data and use locally</div>
      )}
    </div>
  );
};

export const CommonFileInfo: React.FC<{
  dataFileMetadata: { name: string; path: string; size: number };
}> = ({ dataFileMetadata }) => {
  return (
    <>
      <div>
        <span className="detail-label">File Name:</span> {dataFileMetadata.name}
      </div>
      <div>
        <span className="detail-label">File type:</span>{" "}
        {getFileExtension(dataFileMetadata.name).toUpperCase().slice(1)}
      </div>
    </>
  );
};

interface PreviewModalProps {
  onClose: () => void;
  onFileSelected: () => void;
}

export const DataFileModalWrapper: React.FC<PreviewModalProps> = ({ onClose, onFileSelected }) => {
  const { viewMode, parsedData, dataFileMetadata } = useDataFileModalContext();
  const { collectionId } = useCollectionView();

  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const confirmUseDataFile = useCallback(() => {
    if (!dataFileMetadata) return;
    // remove previously set data file
    bufferedEntity.removeDataFile();

    const fileId = dataFileMetadata.name + "-" + Date.now();
    bufferedEntity.setDataFile({
      id: fileId,
      name: dataFileMetadata.name,
      path: dataFileMetadata.path,
      size: dataFileMetadata.size,
      source: "desktop",
      fileFeature: FileFeature.COLLECTION_RUNNER,
    });
    if (parsedData) {
      bufferedEntity.setIterations(parsedData.data.length > 0 ? parsedData.data.length : 1);
    }
    onClose(); // Close modal immediately after confirming
  }, [dataFileMetadata, bufferedEntity, onClose, parsedData]);

  const handleDataFileRemoval = useCallback(() => {
    bufferedEntity.removeDataFile();
    bufferedEntity.setIterations(1);
    onClose();
  }, [onClose, bufferedEntity]);

  const buttonOptions = (): buttonTypes => {
    switch (viewMode) {
      case DataFileModalViewMode.ERROR:
        return {
          secondaryButton: {
            label: "Learn more",
            onClick: () => {
              window.open(API_CLIENT_DOCS.COLLECTION_RUNNER_DATA_FILE, "_blank");
            },
          },
          primaryButton: {
            label: "Select Again",
            onClick: () => {
              onFileSelected();
            },
          },
        };

      case DataFileModalViewMode.PREVIEW:
        if (parsedData?.count !== undefined && parsedData?.count > 1000) {
          return {
            secondaryButton: {
              label: "Replace file",
              onClick: () => {
                onFileSelected();
              },
            },
            primaryButton: {
              label: "Use first 1000 entries",
              onClick: () => {
                trackCollectionRunnerTruncatedFileUsed({ record_count: parsedData?.count });
                confirmUseDataFile();
              },
            },
          };
        } else {
          return {
            secondaryButton: {
              label: "Cancel",
              onClick: () => {
                onClose();
              },
            },
            primaryButton: {
              label: "Use File",
              onClick: () => {
                confirmUseDataFile();
              },
            },
          };
        }

      case DataFileModalViewMode.ACTIVE:
        return {
          secondaryButton: {
            label: "Remove",
            onClick: () => {
              trackCollectionRunnerFileCleared();
              handleDataFileRemoval();
            },
          },
          primaryButton: {
            label: "Change data file",
            onClick: () => {
              onFileSelected();
            },
          },
        };

      case DataFileModalViewMode.LARGE_FILE:
        return {
          secondaryButton: {
            label: "Cancel",
            onClick: () => {
              onClose();
            },
          },
          primaryButton: {
            label: "Reselect File",
            onClick: () => {
              onFileSelected();
            },
          },
        };
      default:
        return {
          secondaryButton: {
            label: "Cancel",
            onClick: () => {
              onClose();
            },
          },
          primaryButton: {
            label: "Reselect File",
            onClick: () => {
              onFileSelected();
            },
          },
        };
    }
  };

  return (
    <RQModal
      className={
        [DataFileModalViewMode.LARGE_FILE, DataFileModalViewMode.LOADING, DataFileModalViewMode.ERROR].includes(
          viewMode
        )
          ? "preview-modal-fixed-width"
          : "preview-modal"
      }
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={() => {
        onClose();
      }}
    >
      {viewMode === DataFileModalViewMode.LOADING && <LoadingView />}
      {viewMode === DataFileModalViewMode.ACTIVE && <DataFileView buttonOptions={buttonOptions} viewMode={viewMode} />}
      {viewMode === DataFileModalViewMode.PREVIEW && parsedData?.count !== undefined && parsedData?.count > 1000 && (
        <WarningView buttonOptions={buttonOptions} />
      )}
      {viewMode === DataFileModalViewMode.PREVIEW && parsedData?.count !== undefined && parsedData?.count <= 1000 && (
        <DataFileView buttonOptions={buttonOptions} viewMode={viewMode} />
      )}
      {viewMode === DataFileModalViewMode.ERROR && <ErroredStateView buttonOptions={buttonOptions} />}
      {viewMode === DataFileModalViewMode.LARGE_FILE && <LargeFileView buttonOptions={buttonOptions} />}
    </RQModal>
  );
};
