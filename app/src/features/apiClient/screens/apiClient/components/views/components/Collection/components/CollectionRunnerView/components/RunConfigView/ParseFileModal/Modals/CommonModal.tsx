import { RQModal } from "lib/design-system/components";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "../ParsedTableView";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "../DataFileModals";
import React from "react";

export const CommonModal: React.FC<ModalProps> = ({ buttonOptions, dataFile, onClose, parsedData, viewMode }) => {
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

      {/*conditional rendering based on viewMode */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <CommonFileInfo dataFile={dataFile} />
          {viewMode === "view" && (
            <div>
              <span className="detail-label">File size:</span>
              {dataFile.size < 1024
                ? `${dataFile.size} B`
                : dataFile.size < 1024 * 1024
                ? `${(dataFile.size / 1024).toFixed(2)} KB`
                : `${(dataFile.size / (1024 * 1024)).toFixed(2)} MB`}
            </div>
          )}
        </div>
        <PreviewTableView datasource={parsedData} />
      </div>

      {viewMode === "view" ? (
        <FooterButtons
          buttonOptions={buttonOptions}
          primaryIcon={<RiDeleteBin6Line />}
          secondaryIcon={<MdOutlineOpenInNew />}
        />
      ) : (
        <FooterButtons buttonOptions={buttonOptions} />
      )}
    </RQModal>
  );
};
