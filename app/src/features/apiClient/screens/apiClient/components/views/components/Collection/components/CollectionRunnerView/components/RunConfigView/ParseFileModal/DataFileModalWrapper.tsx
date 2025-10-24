import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback } from "react";
import "./DataFileModal.scss";
import { useRunConfigStore } from "../../../run.context";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";
import { DataFileViewModal } from "./Modals/DataFileViewModal";
import { WarningModal } from "./Modals/WarningModal";
import { ErroredModal } from "./Modals/ErroredModal";
import { LargeFileModal } from "./Modals/LargeFileModal";
import { LoadingModal } from "./Modals/LoadingModal";
import { FileFeature } from "features/apiClient/store/apiClientFilesStore";
import { useDataFileModalContext, DataFileModalViewMode } from "./DataFileModalContext";
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
  dataFileMetadata: { name: string; path: string; size: number };
  onClose: () => void;
  parsedData?: Record<string, any>[];
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
  dataFileMetadata: { name: string; path: string; size: number };
}

export const DataFileModalWrapper: React.FC<PreviewModalProps> = ({ onClose, onFileSelected, dataFileMetadata }) => {
  const { viewMode, parsedData } = useDataFileModalContext();

  const [removeDataFile, setDataFile, setIterations] = useRunConfigStore((s) => [
    s.removeDataFile,
    s.setDataFile,
    s.setIterations,
  ]);

  const confirmUseDataFile = useCallback(() => {
    const fileId = dataFileMetadata.name + "-" + Date.now();

    setDataFile({
      id: fileId,
      name: dataFileMetadata.name,
      path: dataFileMetadata.path,
      size: dataFileMetadata.size,
      source: "desktop",
      fileFeature: FileFeature.COLLECTION_RUNNER,
    });
    setIterations(parsedData.data.length);
  }, [
    dataFileMetadata.name,
    dataFileMetadata.path,
    dataFileMetadata.size,
    parsedData?.data?.length,
    setDataFile,
    setIterations,
  ]);

  const buttonOptions = (): buttonTypes => {
    switch (viewMode) {
      case DataFileModalViewMode.ERROR:
        return {
          secondaryButton: {
            label: "Learn more",
            onClick: () => {
              onClose();
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
        if (parsedData?.count > 1000) {
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
                confirmUseDataFile();
                onClose();
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
                onClose();
              },
            },
          };
        }

      case DataFileModalViewMode.ACTIVE:
        return {
          secondaryButton: {
            label: "Remove",
            onClick: () => {
              removeDataFile();
              setIterations(1);
              onClose();
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
    }
  };

  return (
    <>
      {viewMode === DataFileModalViewMode.LOADING && <LoadingModal onClose={onClose} />}
      {viewMode === DataFileModalViewMode.ACTIVE && (
        <DataFileViewModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedData?.data}
          viewMode={viewMode}
        />
      )}
      {viewMode === DataFileModalViewMode.PREVIEW && parsedData?.count > 1000 && (
        <WarningModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedData?.data}
          count={parsedData?.count}
        />
      )}
      {viewMode === DataFileModalViewMode.PREVIEW && parsedData?.count <= 1000 && (
        <DataFileViewModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedData?.data}
          viewMode={viewMode}
        />
      )}
      {viewMode === DataFileModalViewMode.ERROR && (
        <ErroredModal buttonOptions={buttonOptions} onClose={onClose} dataFileMetadata={dataFileMetadata} />
      )}
      {viewMode === DataFileModalViewMode.LARGE_FILE && (
        <LargeFileModal buttonOptions={buttonOptions} onClose={onClose} dataFileMetadata={dataFileMetadata} />
      )}
    </>
  );
};
