//states of this modal

import { Table } from "antd";
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
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
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
//stubs
const dataSource = [
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
];

//stubs
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

const PreviewTable = () => (
  <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ x: 648, y: 250 }} />
);

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
        {/*
          ADD LOGIC TO CREATE ITERATIONS COLUMN 
        */}
        <PreviewTable />
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
    <RQModal open={true} closable={true} closeIcon={<MdOutlineClose />} onCancel={onClose} className="preview-modal">
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
        {/*
          ADD LOGIC TO CREATE ITERATIONS COLUMN 
        */}
        <PreviewTable />
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
        <PreviewTable />
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
          <SyntaxHighlighter
            language="json"
            style={stackoverflowDark}
            customStyle={{
              backgroundColor: "var(--requestly-color-background-dark)",
              margin: "8px 0",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "12px",
              lineHeight: "1.5",
            }}
          >
            {`[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]`}
          </SyntaxHighlighter>
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

export const Previewmodal: React.FC<previewModalProps> = ({ status, count, onClose }: previewModalProps) => {
  const [dataFile] = useRunConfigStore((s) => [s.dataFile]);

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
            },
          },
          secondaryButton: {
            label: "Use File",
            onClick: () => {
              //this should push the file to store and close the modal
              //and also now on click the file name on button should open the file in viewModal component
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
              //remove the file from store and close the modal
            },
          },
          secondaryButton: {
            label: "Change data file",
            onClick: () => {
              //remove the existing file from store and open file selector again
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
