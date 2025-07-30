import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import "./apiClientErrorPanel.scss";
import { MdOutlineMenuBook } from "@react-icons/all-files/md/MdOutlineMenuBook";
import { IoWarning } from "@react-icons/all-files/io5/IoWarning";
import { RQAPI } from "features/apiClient/types";
import LINKS from "config/constants/sub/links";

export const ApiClientErrorPanel: React.FC<{
  error: RQAPI.ExecutionError;
}> = ({
  error = {
    source: "request",
    name: "Error",
    message: "Something went wrong",
  },
}) => {
  return (
    <div className="api-client-error-panel-container">
      <div className="api-client-error-panel-header">
        <IoWarning className="warning-icon" />
        <div>Error while executing the {error.source ?? "request"}</div>
      </div>
      <div className="api-client-error-panel-content">
        <div className="api-client-error-panel-message">
          <span className="error-name">{`${error.name}:`}</span>
          <span className="error-message">{error.message}</span>
        </div>
        <div className="api-client-error-panel-actions">
          <RQButton
            size="small"
            icon={<MdOutlineMenuBook />}
            onClick={() => window.open(LINKS.REQUESTLY_API_CLIENT_DOCS, "_blank")}
          />
        </div>
      </div>
    </div>
  );
};
