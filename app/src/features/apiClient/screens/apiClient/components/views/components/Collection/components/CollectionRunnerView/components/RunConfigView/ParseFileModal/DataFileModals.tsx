import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback } from "react";
import "./DataFileModal.scss";
import { useRunConfigStore } from "../../../run.context";
import { getFileExtension, parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { CommonModal } from "./Modals/CommonModal";
import { WarningModal } from "./Modals/WarningModal";
import { ErroredModal } from "./Modals/ErroredModal";
import { LargeFileModal } from "./Modals/LargeFileModal";
import { LoadingModal } from "./Modals/LoadingModal";
import { FileFeature } from "features/apiClient/store/apiClientFilesStore";
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
  viewMode?: any;
}

export const FooterButtons: React.FC<{
  buttonOptions: () => buttonTypes;
  primaryIcon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
}> = ({ buttonOptions, primaryIcon, secondaryIcon }) => {
  return (
    <div className="preview-modal-footer-container">
      <RQButton type="secondary" onClick={buttonOptions().primaryButton.onClick} icon={secondaryIcon ?? null}>
        {buttonOptions().primaryButton.label}
      </RQButton>
      <RQButton type="primary" onClick={buttonOptions().secondaryButton.onClick} icon={primaryIcon ?? null}>
        {buttonOptions().secondaryButton.label}
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
        <div className="preview-modal-title">Preview data use locally</div>
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
  // initialViewMode: "success" | "error" | "view" | "largeFile" | "loading";
  onClose: () => void;
  onFileSelected?: () => void;
  handleSelectFile?: () => void;
  dataFileMetadata: { name: string; path: string; size: number };
  isPreviewMode: boolean;
}

export const DataFileModals: React.FC<PreviewModalProps> = ({
  onClose,
  onFileSelected,
  handleSelectFile,
  dataFileMetadata,
  isPreviewMode = false,
}) => {
  const [viewMode, setViewMode] = React.useState<"success" | "error" | "view" | "largeFile" | "loading">("loading");
  const parsedDataRef = React.useRef<{ data: Record<string, any>[]; count: number } | null>(null);

  const [removeDataFile, setDataFile] = useRunConfigStore((s) => [s.removeDataFile, s.setDataFile]);

  const setDataFileInStore = useCallback(() => {
    const fileId = dataFileMetadata.name + "-" + Date.now();

    setDataFile({
      id: fileId,
      name: dataFileMetadata.name,
      path: dataFileMetadata.path,
      size: dataFileMetadata.size,
      source: "desktop",
      fileFeature: FileFeature.COLLECTION_RUNNER,
    });
  }, [dataFileMetadata.name, dataFileMetadata.path, dataFileMetadata.size, setDataFile]);

  // Parse file on mount using useState lazy initializer (runs only once)
  React.useState(() => {
    parseCollectionRunnerDataFile(dataFileMetadata.path)
      .then((data) => {
        const processedData = {
          data: data.count > 1000 ? data.data.slice(0, 1000) : data.data,
          count: data.count,
        };
        parsedDataRef.current = processedData;
        setViewMode(isPreviewMode ? "view" : "success");
      })
      .catch(() => {
        setViewMode("error");
      });
    return true;
  });

  const buttonOptions = (): buttonTypes => {
    switch (viewMode) {
      case "error":
        return {
          primaryButton: {
            label: "Learn more",
            onClick: () => {
              onClose();
            },
          },
          secondaryButton: {
            label: "Select Again",
            onClick: () => {
              handleSelectFile?.();
            },
          },
        };

      case "success":
        if (parsedDataRef.current?.count > 1000) {
          return {
            primaryButton: {
              label: "Replace file",
              onClick: () => {
                handleSelectFile?.();
              },
            },
            secondaryButton: {
              label: "Use first 1000 entries",
              onClick: () => {
                setDataFileInStore();
                onClose();
              },
            },
          };
        } else {
          return {
            primaryButton: {
              label: "Cancel",
              onClick: () => {
                removeDataFile();
                onClose();
              },
            },
            secondaryButton: {
              label: "Use File",
              onClick: () => {
                setDataFileInStore();
                onClose();
              },
            },
          };
        }

      case "view":
        return {
          primaryButton: {
            label: "Remove",
            onClick: () => {
              removeDataFile();
              onClose();
            },
          },
          secondaryButton: {
            label: "Change data file",
            onClick: () => {
              handleSelectFile?.();
            },
          },
        };

      case "largeFile":
        return {
          primaryButton: {
            label: "Cancel",
            onClick: () => {
              //just close the modal
              onClose();
            },
          },
          secondaryButton: {
            label: "Reselect File",
            onClick: () => {
              //remove the existing file from store and open file selector again
              handleSelectFile?.();
            },
          },
        };
    }
  };

  return (
    <>
      {viewMode === "loading" && <LoadingModal onClose={onClose} />}
      {viewMode === "view" && (
        <CommonModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedDataRef.current?.data}
          viewMode={viewMode}
        />
      )}
      {viewMode === "success" && parsedDataRef.current?.count > 1000 && (
        <WarningModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedDataRef.current?.data}
          count={parsedDataRef.current?.count}
        />
      )}
      {viewMode === "error" && (
        <ErroredModal buttonOptions={buttonOptions} onClose={onClose} dataFileMetadata={dataFileMetadata} />
      )}
      {viewMode === "success" && parsedDataRef.current?.count < 1000 && (
        <CommonModal
          buttonOptions={buttonOptions}
          dataFileMetadata={dataFileMetadata}
          onClose={onClose}
          parsedData={parsedDataRef.current?.data}
          viewMode={viewMode}
        />
      )}
      {viewMode === "largeFile" && (
        <LargeFileModal buttonOptions={buttonOptions} onClose={onClose} dataFileMetadata={dataFileMetadata} />
      )}
    </>
  );
};
