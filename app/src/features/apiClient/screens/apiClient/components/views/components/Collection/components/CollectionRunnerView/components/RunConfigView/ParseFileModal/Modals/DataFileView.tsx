import React from "react";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { PreviewTableView } from "../ParsedTableView";
import { CommonFileInfo, FooterButtons, ModalHeader, ModalProps } from "./DataFileModalWrapper";
import { DataFileModalViewMode, useDataFileModalContext } from "./DataFileModalContext";
import { NativeError } from "errors/NativeError";
import { FiUpload } from "@react-icons/all-files/fi/FiUpload";

export const getformattedFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const DataFileView: React.FC<ModalProps> = ({ buttonOptions, viewMode }) => {
  const { dataFileMetadata, parsedData } = useDataFileModalContext();

  if (!dataFileMetadata) {
    return;
  }

  if (!parsedData) {
    throw new NativeError("Parsed data is required for DataFileView").addContext({
      dataFileMetadata,
    });
  }

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
        <PreviewTableView datasource={parsedData.data} />
      </div>

      {viewMode === DataFileModalViewMode.ACTIVE ? (
        <FooterButtons buttonOptions={buttonOptions} primaryIcon={<FiUpload />} secondaryIcon={<RiDeleteBin6Line />} />
      ) : (
        <FooterButtons buttonOptions={buttonOptions} />
      )}
    </>
  );
};
