import React from "react";
import { FooterButtons, ModalProps } from "./DataFileModalWrapper";

export const LargeFileModal: React.FC<ModalProps> = ({ buttonOptions, onClose }) => {
  return (
    <>
      <div className="preview-modal-header-container">
        <div className="preview-modal-title">File Exceeds 100 MB Limit</div>
      </div>

      <div className="large-file-messaging-container">
        <span className="large-file-text">
          The file is too large to upload. Select a smaller data file to continue.
        </span>
      </div>

      <FooterButtons buttonOptions={buttonOptions} />
    </>
  );
};
