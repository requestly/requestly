import LINKS from "config/constants/sub/links";
import { RunnerFileMissingError } from "../RunnerFileMissingError";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "./runnerFsMissing.scss";
import React from "react";

interface Props {
  error: RunnerFileMissingError;
}
export const RunnerFileMissing: React.FC<Props> = ({ error }) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="Error card" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{error.getErrorHeading()}</div>
          <div className="file-error-container">
            <span className="error-message">
              "The selected data file was moved, renamed, or deleted from your computer. Choose the correct file again
              to continue testing."
            </span>
          </div>
        </div>

        <a className="documentation-link" href={LINKS.REQUESTLY_API_CLIENT_DOCS} target="_blank" rel="noreferrer">
          <MdOutlineOpenInNew />
          <span>Read Troubleshooting guide</span>
        </a>
      </div>
    </>
  );
};
