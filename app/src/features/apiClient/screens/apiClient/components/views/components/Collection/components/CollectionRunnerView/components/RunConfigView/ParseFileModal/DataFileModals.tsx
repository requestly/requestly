//states of this modal
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useEffect } from "react";
import "./DataFileModal.scss";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { BsExclamationTriangle } from "@react-icons/all-files/bs/BsExclamationTriangle";
import { useRunConfigStore } from "../../../run.context";
import { getFileExtension, parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "./ParsedTableView";
import { RunConfigState } from "features/apiClient/store/collectionRunConfig/runConfig.store";

interface buttonSchema {
  label: string;
  onClick: () => void;
}

interface buttonTypes {
  primaryButton: buttonSchema;
  secondaryButton: buttonSchema;
}

const LoadingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <RQModal
      width={480}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={onClose}
      className="preview-modal loading-modal"
    >
      {/* Section 1 */}
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Processing File</div>
      </div>

      {/* Section 2 */}
      <div className="loading-state-container">
        <div className="loading-spinner">
          <div className="spinner-placeholder">
            <svg
              className="spinner-icon"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80 40"
                opacity="0.25"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80 40"
                strokeDashoffset="0"
                className="spinner-circle"
              />
            </svg>
          </div>
        </div>
        <div className="loading-message">
          <div className="loading-title">Parsing your file...</div>
          <div className="loading-description detail-label">
            Please wait while we process and validate your data file.
          </div>
        </div>
      </div>
    </RQModal>
  );
};

const ParsingModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose }) => {
  return (
    <RQModal
      width={680}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={() => {
        onClose();
        // removeDataFile();
      }}
      className="preview-modal"
    >
      {/* Section 1 */}
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Preview data use locally</div>
      </div>

      {/* Section 2 */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <div>
            <span className="detail-label">File Name:</span> {dataFile.name}
          </div>
          <div>
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase().slice(1)}
          </div>
        </div>
        <PreviewTableView />
      </div>

      {/* Section 3 */}
      <div className="preview-modal-footer-container">
        <RQButton type="secondary" onClick={buttonOptions().primaryButton.onClick}>
          {buttonOptions().primaryButton.label}
        </RQButton>
        <RQButton type="primary" onClick={buttonOptions().secondaryButton.onClick}>
          {buttonOptions().secondaryButton.label}
        </RQButton>
      </div>
    </RQModal>
  );
};

interface ModalProps {
  buttonOptions: () => buttonTypes;
  dataFile: RunConfigState["dataFile"];
  onClose: () => void;
}

const PreviewModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose }) => {
  return (
    <RQModal
      width={680}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={onClose}
      className="preview-modal"
    >
      {/* Section 1 */}
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Preview: {dataFile.name}</div>
      </div>

      {/* Section 2 */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <div>
            <span className="detail-label">File Name:</span> {dataFile.name}
          </div>
          <div>
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase().slice(1)}
          </div>
          <div>
            <span className="detail-label">File size:</span>{" "}
            {dataFile.size < 1024 ? `${dataFile.size} B` : `${(dataFile.size / 1024).toFixed(2)} KB`}
          </div>
        </div>
        <PreviewTableView />
      </div>
      {/* Section 3 */}
      <div className="preview-modal-footer-container">
        <RQButton type="secondary" icon={<RiDeleteBin6Line />} onClick={buttonOptions().primaryButton.onClick}>
          {buttonOptions().primaryButton.label}
        </RQButton>
        <RQButton type="primary" icon={<MdOutlineOpenInNew />} onClick={buttonOptions().secondaryButton.onClick}>
          {buttonOptions().secondaryButton.label}
        </RQButton>
      </div>
    </RQModal>
  );
};

const WarningModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose }) => {
  return (
    <RQModal
      width={680}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={() => {
        onClose();
        // removeDataFile();
      }}
      className="preview-modal"
    >
      {/* Section 1 */}
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Preview data use locally</div>
      </div>

      {/* Section 2 */}
      <div className="warning-state-messaging-container">
        <div className="warning-state-banner-container">
          <div className="warning-state-banner-fields">
            <div className="warning-icon">
              <BsExclamationTriangle />
            </div>
            <span className="warning-text">
              Runner currently supports max 1000 iterations. Upload a smaller file or continue with the first 1000.
            </span>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <div>
            <span className="detail-label">Showing</span> first 1000 <span className="detail-label">of</span>
            {/* TODO@nafees */}
            {/* {count}{" "} */}
            entires
          </div>
          <div>
            <span className="detail-label">File Name:</span> {dataFile.name}
          </div>
          <div>
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase().slice(1)}
          </div>
        </div>
        <PreviewTableView />
      </div>

      {/* Section 3 */}
      <div className="preview-modal-footer-container">
        <RQButton type="secondary" onClick={buttonOptions().primaryButton.onClick}>
          {buttonOptions().primaryButton.label}
        </RQButton>
        <RQButton type="primary" onClick={buttonOptions().secondaryButton.onClick}>
          {buttonOptions().secondaryButton.label}
        </RQButton>
      </div>
    </RQModal>
  );
};

const ErroredModal: React.FC<ModalProps> = ({ buttonOptions, onClose }) => {
  return (
    <RQModal
      width={680}
      open={true}
      closable={true}
      closeIcon={<MdOutlineClose />}
      onCancel={() => {
        onClose();
        // removeDataFile();
      }}
      className="preview-modal"
    >
      {/* Section 1 */}
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">Preview data use locally</div>
      </div>

      {/* Section 2 */}
      <div className="error-state-messaging-container">
        <div>
          <img src={"/assets/media/apiClient/file-error.svg"} alt="Error card" width={80} height={80} />
        </div>
        <div>Invalid JSON file uploaded</div>
        <div className="detail-label">
          Oops! We couldn't parse your file — it must be a valid JSON array of key-value objects.
        </div>

        <div className="error-state-fix-suggestion">
          <div className="example-label">EXAMPLE FORMAT:</div>
          <pre className="code-example">
            <code>
              <span className="punctuation">[</span>
              {"\n  "}
              <span className="punctuation">{"{"}</span>
              <span className="key">"name"</span>
              <span className="punctuation">: </span>
              <span className="value">"Alice"</span>
              <span className="punctuation">, </span>
              <span className="key">"age"</span>
              <span className="punctuation">: </span>
              <span className="value">30</span>
              <span className="punctuation">{"}"}</span>
              <span className="punctuation">,</span>
              {"\n  "}
              <span className="punctuation">{"{"}</span>
              <span className="key">"name"</span>
              <span className="punctuation">: </span>
              <span className="value">"Bob"</span>
              <span className="punctuation">, </span>
              <span className="key">"age"</span>
              <span className="punctuation">: </span>
              <span className="value">25</span>
              <span className="punctuation">{"}"}</span>
              {"\n"}
              <span className="punctuation">]</span>
            </code>
          </pre>
        </div>

        <div className="error-state-footer-container">
          <RQButton icon={<MdOutlineOpenInNew />} type="secondary" onClick={buttonOptions().primaryButton.onClick}>
            {buttonOptions().primaryButton.label}
          </RQButton>
          <RQButton type="primary" onClick={buttonOptions().secondaryButton.onClick}>
            {buttonOptions().secondaryButton.label}
          </RQButton>
        </div>
      </div>
    </RQModal>
  );
};

const LargeFileModal: React.FC<ModalProps> = ({ buttonOptions, onClose }) => {
  return (
    <>
      <RQModal
        width={480}
        open={true}
        closable={true}
        closeIcon={<MdOutlineClose />}
        onCancel={onClose}
        className="preview-modal"
      >
        {/* Section 1 */}
        <div className="preview-modal-header-container">
          <div className="preview-modal-title">File Exceeds 100 MB Limit</div>
        </div>

        {/* Section 2 */}
        <div className="large-file-messaging-container">
          <span className="large-file-text">
            The file is too large to upload. Select a smaller data file to continue.
          </span>
        </div>

        {/* Section 3 */}
        <div className="preview-modal-footer-container">
          <RQButton type="secondary" onClick={buttonOptions().primaryButton.onClick}>
            {buttonOptions().primaryButton.label}
          </RQButton>
          <RQButton type="primary" onClick={buttonOptions().secondaryButton.onClick}>
            {buttonOptions().secondaryButton.label}
          </RQButton>
        </div>
      </RQModal>
    </>
  );
};

/**
 * 1. successfull parsing, upload pending - show table, filename, type & cancel, usefile btn
 * 2. unsucessfull parsing - show error message with learn more & select again option
 * 3. successfull parsing, but too many rows/iterations - show error message with replace file & use first 1k entries
 * 4. show preview - for removing & change/upload data file
 **/

/**
 * status,
 * array of columns & data for table
 * count of rows
 */

interface PreviewModalProps {
  initialStatus: "success" | "error" | "view" | "largeFile" | "loading";
  onClose: () => void;
  onFileSelected?: () => void;
  handleSelectFile?: () => void;
  dataFile: RunConfigState["dataFile"];
  isDataFileValid: boolean;
}

export const DataFileModals: React.FC<PreviewModalProps> = ({
  initialStatus,
  onClose,
  onFileSelected,
  handleSelectFile,
  dataFile,
}) => {
  const [status, setStatus] = React.useState<"success" | "error" | "view" | "largeFile" | "loading">(initialStatus);
  const [count, setCount] = React.useState<number>(0);
  const [removeDataFile] = useRunConfigStore((s) => [s.removeDataFile]);

  const parseDataFile = useCallback(async () => {
    if (!dataFile) return;

    try {
      const parsedData = await parseCollectionRunnerDataFile(dataFile.path);
      if (parsedData) {
        setStatus("success");
        setCount(parsedData.count);
      }
    } catch (err) {
      setStatus("error");
    }
  }, [dataFile]);

  useEffect(() => {
    parseDataFile();
  }, [parseDataFile]);

  //stubs: footer buttton options
  const buttonOptions = (): buttonTypes => {
    switch (status) {
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
      {status === "loading" && <LoadingModal onClose={onClose} />}
      {status === "view" && <PreviewModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} />}
      {status === "success" && count > 1000 && (
        <WarningModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} />
      )}
      {status === "error" && <ErroredModal buttonOptions={buttonOptions} onClose={onClose} dataFile={dataFile} />}
      {status === "success" && count < 1000 && (
        <ParsingModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} />
      )}
      {status === "largeFile" && <LargeFileModal buttonOptions={buttonOptions} onClose={onClose} dataFile={dataFile} />}
    </>
  );
};
