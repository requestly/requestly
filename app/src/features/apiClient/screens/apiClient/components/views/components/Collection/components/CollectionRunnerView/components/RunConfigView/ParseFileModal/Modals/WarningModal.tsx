import { RQModal } from "lib/design-system/components";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "../DataFileModals";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { BsExclamationTriangle } from "@react-icons/all-files/bs/BsExclamationTriangle";
import { PreviewTableView } from "../ParsedTableView";
import React from "react";

export const WarningModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose, parsedData }) => {
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
      <ModalHeader dataFile={dataFile} />

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
            <span className="detail-label">Showing</span> first 1000 <span className="detail-label">of</span>
            {/* TODO@nafees */}
            {/* {count}{" "} */}
            entries
          </div>
          <CommonFileInfo dataFile={dataFile} />
        </div>
        <PreviewTableView datasource={parsedData} />
      </div>

      <FooterButtons buttonOptions={buttonOptions} />
    </RQModal>
  );
};
