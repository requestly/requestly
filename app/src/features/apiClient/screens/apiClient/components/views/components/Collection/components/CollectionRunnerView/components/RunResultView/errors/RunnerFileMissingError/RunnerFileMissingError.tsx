import React from "react";
import { RenderableError } from "errors/RenderableError";
import LINKS from "config/constants/sub/links";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "../collectionRunnerErrors.scss";

export class RunnerFileMissingError extends RenderableError {
  render() {
    return <RunnerFileMissing error={this} />;
  }

  getErrorHeading() {
    return "File missing. We couldn't run the test";
  }
}

const RunnerFileMissing: React.FC<{ error: RunnerFileMissingError }> = ({ error }) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={"/assets/media/apiClient/file-error.svg"} alt="file error illustration" width={80} height={80} />
          <div className="api-client-error-placeholder-content__title">{error.getErrorHeading()}</div>
          <div className="runner-error-container">
            <span className="runner-error-message">
              The selected data file was moved, renamed, or deleted from your computer. Choose the correct file again to
              continue testing.
            </span>
          </div>
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
