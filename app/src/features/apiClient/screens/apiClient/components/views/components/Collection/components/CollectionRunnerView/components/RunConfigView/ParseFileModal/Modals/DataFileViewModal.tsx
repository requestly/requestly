import React from "react";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "../ParsedTableView";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "./DataFileModalWrapper";
import { DataFileModalViewMode } from "./DataFileModalContext";

export const getformattedFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

type DataFileViewModalProps = ModalProps & {
  parsedData: Record<string, any>[];
};

export const DataFileViewModal: React.FC<DataFileViewModalProps> = ({
  buttonOptions,
  dataFileMetadata,
  onClose,
  parsedData,
  viewMode,
}) => {
  return (
    <>
      <ModalHeader dataFileMetadata={dataFileMetadata} />

      {/*conditional rendering based on viewMode */}
      <div className="preview-modal-body-container">
        <div className="preview-file-details">
          <CommonFileInfo dataFileMetadata={dataFileMetadata} />
          {viewMode === DataFileModalViewMode.ACTIVE && (
            <div>
              <span className="detail-label">File size: </span>
              {getformattedFileSize(dataFileMetadata.size)}
            </div>
          )}
        </div>
        <PreviewTableView datasource={parsedData} />
      </div>

      {viewMode === DataFileModalViewMode.ACTIVE ? (
        <FooterButtons
          buttonOptions={buttonOptions}
          primaryIcon={<MdOutlineOpenInNew />}
          secondaryIcon={<RiDeleteBin6Line />}
        />
      ) : (
        <FooterButtons buttonOptions={buttonOptions} />
      )}
    </>
  );
};
