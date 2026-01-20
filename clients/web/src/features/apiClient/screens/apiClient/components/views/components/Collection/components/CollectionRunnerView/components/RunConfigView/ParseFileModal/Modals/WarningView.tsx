import React from "react";
import { BsExclamationTriangle } from "@react-icons/all-files/bs/BsExclamationTriangle";
import { PreviewTableView } from "../ParsedTableView";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "./DataFileModalWrapper";
import { useDataFileModalContext } from "./DataFileModalContext";
import { NativeError } from "errors/NativeError";

type WarningModalProps = ModalProps;

export const WarningView: React.FC<WarningModalProps> = ({ buttonOptions }) => {
  const { dataFileMetadata, parsedData } = useDataFileModalContext();

  if (!dataFileMetadata) {
    return null;
  }

  if (!parsedData) {
    throw new NativeError("Parsed data is required for WarningView").addContext({
      dataFileMetadata,
    });
  }

  return (
    <>
      <ModalHeader dataFileMetadata={dataFileMetadata} />

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

      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <div>
            <span className="detail-label">Showing</span> first 1000 <span className="detail-label">of </span>
            {parsedData.count} entries
          </div>
          <CommonFileInfo dataFileMetadata={dataFileMetadata} />
        </div>
        <PreviewTableView datasource={parsedData.data} />
      </div>

      <FooterButtons buttonOptions={buttonOptions} />
    </>
  );
};
