import React from "react";
import { RenderableError } from "errors/RenderableError";
import LINKS from "config/constants/sub/links";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "../collectionRunnerErrors.scss";
import { useRunConfigStore } from "../../../../run.context";
import { DataFileFormatExample } from "../../../DataFileFormatExample/DataFileFormatExample";

export class DataFileParseError extends RenderableError {
  render() {
    return <DataFileParseErrorComponent error={this} />;
  }

  getErrorHeading() {
    return "Oops! We couldn't parse your file.";
  }
}

const DataFileParseErrorComponent: React.FC<{ error: DataFileParseError }> = ({ error }) => {
  const [dataFile] = useRunConfigStore((s) => [s.dataFile]);
  const fileExtension = (dataFile?.path ? dataFile.path.split(".").pop()?.toUpperCase() : null) ?? "JSON";

  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="file error illustration" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{error.getErrorHeading()}</div>
          <div className="runner-error-detail">
            <span className="runner-error-message">
              The selected file must be a valid{" "}
              {fileExtension === "JSON" ? "JSON array of key-value objects." : "CSV format with headers."}
            </span>
          </div>
          <DataFileFormatExample fileExtension={fileExtension} showLabel={true} />
        </div>

        <a
          className="documentation-link"
          href={LINKS.REQUESTLY_API_CLIENT_DOCS}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdOutlineOpenInNew />
          <span>Read Troubleshooting guide</span>
        </a>
      </div>
    </>
  );
};
