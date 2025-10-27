import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import React from "react";
import { FooterButtons, ModalHeader, ModalProps } from "./DataFileModalWrapper";
import { getFileExtension } from "features/apiClient/screens/apiClient/utils";
import { useDataFileModalContext } from "./DataFileModalContext";
import { DataFileFormatExample } from "../../../DataFileFormatExample/DataFileFormatExample";

export const ErroredStateView: React.FC<ModalProps> = ({ buttonOptions }) => {
  const { dataFileMetadata } = useDataFileModalContext();

  const fileExtension =
    (dataFileMetadata?.path ? getFileExtension(dataFileMetadata.path)?.toUpperCase()?.split(".")?.pop() : null) ??
    "JSON";

  return (
    <>
      <ModalHeader dataFileMetadata={dataFileMetadata ?? { name: "", path: "", size: 0 }} />
      <div className="error-state-messaging-container">
        <div>
          <img src={"/assets/media/apiClient/file-error.svg"} alt="file error illustration" width={80} height={80} />
        </div>
        <div>Invalid {fileExtension} file uploaded</div>
        <div className="detail-label">
          Oops! We couldn't parse your file — it must be a valid{" "}
          {fileExtension === "JSON" ? "JSON array of key-value objects." : "CSV format with headers."}
        </div>

        <div className="error-state-fix-suggestion">
          <DataFileFormatExample fileExtension={fileExtension} showLabel={true} />
        </div>

        <FooterButtons buttonOptions={buttonOptions} secondaryIcon={<MdOutlineOpenInNew />} />
      </div>
    </>
  );
};
