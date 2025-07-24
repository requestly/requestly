import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import LINKS from "config/constants/sub/links";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import React from "react";

const ApiClientFileMissingError: React.FC<{
  error: RQAPI.ExecutionError;
  imageUrl: string;
  showTitle?: boolean;
  onRetry: () => void;
}> = ({ error, imageUrl, showTitle = true, onRetry }) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={imageUrl} alt="Error card" width={80} height={80} />
          {showTitle && (
            <div className="api-client-error-placeholder-content__title">{"Request not sent — file missing"}</div>
          )}
          <div className="file-error-container">
            <span className="error-message">{`${error.reason}`}</span>
          </div>
          <RQButton icon={<MdOutlineRefresh />} onClick={onRetry}>
            Try Again
          </RQButton>
        </div>

        <a className="documentation-link" href={LINKS.REQUESTLY_API_CLIENT_DOCS} target="_blank" rel="noreferrer">
          <MdOutlineOpenInNew />
          <span>Troubleshooting guide</span>
        </a>
      </div>
    </>
  );
};
export default ApiClientFileMissingError;
