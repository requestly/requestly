import React from "react";
import { RQAPI } from "features/apiClient/types";
import LINKS from "config/constants/sub/links";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "./emptyResponsePlaceholder.scss";
import { RQButton } from "lib/design-system-v2/components";

export const ApiClientErrorPlaceholder: React.FC<{ error: RQAPI.ExecutionError; imageUrl: string }> = ({
  error,
  imageUrl,
}) => {
  return (
    <>
      <div className="api-client-error-placeholder-container">
        <div className="api-client-error-placeholder-content">
          <img src={imageUrl} alt="Error card" width={80} height={80} />
          <div className="api-client-empty-response-view__title">{`Error while executing the ${error.source}`}</div>
          <div className="error-container">
            <span className="error-name">{`${error.name}:`}</span>
            {""}
            <span className="error-message">{error.message}</span>
          </div>
          <RQButton>Try Again</RQButton>
        </div>

        <a className="documentation-link" href={LINKS.REQUESTLY_API_CLIENT_DOCS} target="_blank" rel="noreferrer">
          <MdOutlineOpenInNew />
          <span>Troubleshooting guide</span>
        </a>
      </div>
    </>
  );
};
