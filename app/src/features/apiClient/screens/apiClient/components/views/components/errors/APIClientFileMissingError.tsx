import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import LINKS from "config/constants/sub/links";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import React from "react";

interface TitleConfig {
  flag: boolean;
  title?: string;
}

const ApiClientFileMissingError: React.FC<{
  error: RQAPI.ExecutionError;
  imageUrl: string;
  showTitle?: TitleConfig;
  showButton?: boolean;
  onRetry?: () => void;
}> = ({
  error,
  imageUrl,
  showTitle = { flag: true, title: "Request not sent — file missing" },
  showButton = true,
  onRetry,
}) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={imageUrl} alt="Error card" width={80} height={80} />
          {showTitle.flag && showTitle.title && (
            <div className="api-client-error-placeholder-content__title">{showTitle.title}</div>
          )}
          <div className="file-error-container">
            <span className="error-message">{`${error.reason}`}</span>
          </div>
          {showButton && onRetry && (
            <RQButton icon={<MdOutlineRefresh />} onClick={onRetry}>
              Try Again
            </RQButton>
          )}
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
