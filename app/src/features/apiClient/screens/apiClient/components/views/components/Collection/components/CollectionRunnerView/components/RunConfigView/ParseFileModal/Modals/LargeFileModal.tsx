import { RQModal } from "lib/design-system/components";
import { FooterButtons, ModalProps } from "../DataFileModals";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import React from "react";

export const LargeFileModal: React.FC<ModalProps> = ({ buttonOptions, onClose }) => {
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
        <div className="preview-modal-header-container">
          <div className="preview-modal-title">File Exceeds 100 MB Limit</div>
        </div>

        <div className="large-file-messaging-container">
          <span className="large-file-text">
            The file is too large to upload. Select a smaller data file to continue.
          </span>
        </div>

        <FooterButtons buttonOptions={buttonOptions} />
      </RQModal>
    </>
  );
};
