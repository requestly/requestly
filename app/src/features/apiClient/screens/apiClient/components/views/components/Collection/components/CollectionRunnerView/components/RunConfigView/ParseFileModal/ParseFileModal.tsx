//states of this modal
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./parseFileModal.scss";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { BsExclamationTriangle } from "@react-icons/all-files/bs/BsExclamationTriangle";
import { useRunConfigStore } from "../../../run.context";
import { ApiClientFile, FileId } from "features/apiClient/store/apiClientFilesStore";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "./ParsedTableView";
import { useFileSelection } from "../hooks/useFileSelection.hook";
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

interface previewModalProps {
  status: "success" | "error" | "tooManyRows" | "parsing";
  count?: number;
  onClose: () => void;
  onFileSelected?: () => void;
}

interface buttonSchema {
  label: string;
  onClick: () => void;
}

interface buttonTypes {
  primaryButton: buttonSchema;
  secondaryButton: buttonSchema;
}

interface ModalProps {
  buttonOptions: () => buttonTypes;
  dataFile?: Omit<ApiClientFile, "isFileValid"> & { id: FileId };
  onClose: () => void;
  count?: number;
}

const ParsingModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose }) => {
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
        <div className="preview-modal-title">Preview data use locally</div>
      </div>

      {/* Section 2 */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <div>
            <span className="detail-label">File Name:</span> {dataFile.name}
          </div>
          <div>
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase()}
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

const ViewModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose }) => {
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
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase()}
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

const WarningModal: React.FC<ModalProps> = ({ buttonOptions, count, dataFile, onClose }) => {
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
            <span className="detail-label">Showing</span> first 1000 <span className="detail-label">of</span> {count}{" "}
            entires
          </div>
          <div>
            <span className="detail-label">File Name:</span> {dataFile.name}
          </div>
          <div>
            <span className="detail-label">File type:</span> {getFileExtension(dataFile.name).toUpperCase()}
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
      onCancel={onClose}
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
          <RQButton icon={<MdOutlineOpenInNew />} type="secondary">
            {buttonOptions().primaryButton.label}
          </RQButton>
          <RQButton type="primary">{buttonOptions().secondaryButton.label}</RQButton>
        </div>
      </div>
    </RQModal>
  );
};

export const Previewmodal: React.FC<previewModalProps> = ({
  status,
  count,
  onClose,
  onFileSelected,
}: previewModalProps) => {
  const [dataFile] = useRunConfigStore((s) => [s.dataFile]);
  const { openFileSelector } = useFileSelection();

  //stubs: footer buttton options

  const buttonOptions = (): buttonTypes => {
    switch (status) {
      case "parsing":
        return {
          primaryButton: {
            label: "Cancel",
            onClick: () => {
              //it should close the modal
              //delete the file from store
              onClose();
            },
          },
          secondaryButton: {
            label: "Use File",
            onClick: () => {
              //this should push the file to store and close the modal
              //and also now on click the file name on button should open the file in viewModal component
              openFileSelector(() => {
                onFileSelected?.();
              });
            },
          },
        };

      case "error":
        return {
          primaryButton: {
            label: "Learn more",
            onClick: () => {},
          },
          secondaryButton: {
            label: "Select Again",
            onClick: () => {
              /**
                 // delete the existing file from store
                 // then move to re-upload screen again    
                 */
              openFileSelector(() => {
                onFileSelected?.();
              });
            },
          },
        };

      case "tooManyRows":
        return {
          primaryButton: {
            label: "Replace file",
            onClick: () => {
              //remove the existing file from store and open file selector again
              //if cancel/cross is done then is should not remove the existing file & retain the existing file
              openFileSelector(() => {
                onFileSelected?.();
              });
            },
          },
          secondaryButton: {
            label: "Use first 1000 entries",
            onClick: () => {
              //close modal only i think
            },
          },
        };

      case "success":
        return {
          primaryButton: {
            label: "Remove",
            onClick: () => {
              onClose();
              //remove the file from store and close the modal
            },
          },
          secondaryButton: {
            label: "Change data file",
            onClick: () => {
              //remove the existing file from store and open file selector again
              openFileSelector(() => {
                onFileSelected?.();
              });
            },
          },
        };
    }
  };

  return (
    <>
      {status === "success" && <ViewModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} />}
      {status === "tooManyRows" && count > 1000 && (
        <WarningModal buttonOptions={buttonOptions} count={count} dataFile={dataFile} onClose={onClose} />
      )}
      {status === "error" && <ErroredModal buttonOptions={buttonOptions} onClose={onClose} />}
      {status === "parsing" && <ParsingModal buttonOptions={buttonOptions} dataFile={dataFile} onClose={onClose} />}
    </>
  );
};
