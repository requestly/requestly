import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useEffect } from "react";
import "./DataFileModal.scss";
import { useRunConfigStore } from "../../../run.context";
import { getFileExtension, parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { RunConfigState } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import { CommonModal } from "./Modals/CommonModal";
import { WarningModal } from "./Modals/WarningModal";
import { ErroredModal } from "./Modals/ErroredModal";
import { LargeFileModal } from "./Modals/LargeFileModal";
import { LoadingModal } from "./Modals/LoadingModal";
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
  dataFile: RunConfigState["dataFile"];
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

export const ModalHeader: React.FC<{ dataFile?: RunConfigState["dataFile"] }> = ({ dataFile }) => {
  return (
    <div className="preview-modal-header-container">
      {dataFile?.name ? (
        <div className="preview-modal-title">Preview: {dataFile.name}</div>
      ) : (
        <div className="preview-modal-title">Preview data use locally</div>
      )}
    </div>
  );
};

export const CommonFileInfo: React.FC<{
  dataFile: RunConfigState["dataFile"];
}> = ({ dataFile }) => {
  return (
    <>
      <div>
        <span className="detail-label">File Name:</span> {dataFile.name}
      </div>
      <div>
        <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase().slice(1)}
      </div>
    </>
  );
};

interface PreviewModalProps {
  initialViewMode: "success" | "error" | "view" | "largeFile" | "loading";
  onClose: () => void;
  onFileSelected?: () => void;
  handleSelectFile?: () => void;
  dataFile: RunConfigState["dataFile"];
  isDataFileValid: boolean;
}

export const DataFileModals: React.FC<PreviewModalProps> = ({
  initialViewMode,
  onClose,
  onFileSelected,
  handleSelectFile,
  dataFile,
}) => {
  const [viewMode, setViewMode] = React.useState<"success" | "error" | "view" | "largeFile" | "loading">(
    initialViewMode
  );
  const [count, setCount] = React.useState<number>(0);
  const [removeDataFile] = useRunConfigStore((s) => [s.removeDataFile]);
  const [parsedData, setParsedData] = React.useState<Record<string, any>[] | null>(null);

  const parseDataFile = useCallback(async () => {
    if (!dataFile) return;

    try {
      const parsedData = await parseCollectionRunnerDataFile(dataFile.path);
      if (parsedData) {
        setViewMode("success"); //TODO @nafees also handle view mode here
        setCount(parsedData.count);
        setParsedData(parsedData.data);
      }
    } catch (err) {
      setViewMode("error");
    }
  }, [dataFile]);

  useEffect(() => {
    parseDataFile();
  }, [parseDataFile]);

  //stubs: footer buttton options
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
              /*
                 // delete the existing file from store
                 // SO THAT DATAFILE GETS EMPTY
                 // then move to re-upload screen again
              */
            },
          },
        };

      case "success":
        if (count > 1000) {
          return {
            primaryButton: {
              label: "Replace file",
              onClick: () => {
                //remove the existing file from store and open file selector again
                //if cancel/cross is done then is should not remove the existing file & retain the existing file
                handleSelectFile?.();
              },
            },
            secondaryButton: {
              label: "Use first 1000 entries",
              onClick: () => {
                //use first 1000 entries
                //close modal
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
                //remove the file from store
                //SO THAT DATAFILE GETS EMPTY
                //just close the modal without saving
              },
            },
            secondaryButton: {
              label: "Use File",
              onClick: () => {
                //use this file and add it to store
                //and also now on click the file name on button should open the file in viewModal component
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
              //remove the file from store and close the modal
              removeDataFile();
              onClose();
            },
          },
          secondaryButton: {
            label: "Change data file",
            onClick: () => {
              //remove the existing file from store and open file selector again
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
          dataFile={dataFile}
          onClose={onClose}
          parsedData={parsedData}
          viewMode={viewMode}
        />
      )}
      {viewMode === "success" && count > 1000 && (
        <WarningModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} parsedData={parsedData} />
      )}
      {viewMode === "error" && <ErroredModal buttonOptions={buttonOptions} onClose={onClose} dataFile={dataFile} />}
      {viewMode === "success" && count < 1000 && (
        <CommonModal
          buttonOptions={buttonOptions}
          dataFile={dataFile}
          onClose={onClose}
          parsedData={parsedData}
          viewMode={viewMode}
        />
      )}
      {viewMode === "largeFile" && (
        <LargeFileModal buttonOptions={buttonOptions} onClose={onClose} dataFile={dataFile} />
      )}
    </>
  );
};
