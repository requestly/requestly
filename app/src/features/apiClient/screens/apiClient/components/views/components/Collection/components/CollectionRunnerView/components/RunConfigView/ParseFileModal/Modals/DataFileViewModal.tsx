import { RQModal } from "lib/design-system/components";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineClose } from "@react-icons/all-files/md/MdOutlineClose";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "../ParsedTableView";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "../DataFileModalWrapper";
import React from "react";

export const getformattedFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const DataFileViewModal: React.FC<ModalProps> = ({
  buttonOptions,
  dataFileMetadata,
  onClose,
  parsedData,
  viewMode,
}) => {
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
      <ModalHeader dataFileMetadata={dataFileMetadata} />

      {/*conditional rendering based on viewMode */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <CommonFileInfo dataFileMetadata={dataFileMetadata} />
          {viewMode === "view" && (
            <div>
              <span className="detail-label">File size:</span>
              {getformattedFileSize(dataFileMetadata.size)}
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
