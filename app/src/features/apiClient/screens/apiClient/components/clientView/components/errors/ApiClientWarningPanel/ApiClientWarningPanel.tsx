import { RQButton } from "lib/design-system-v2/components";
import React from "react";
import { MdOutlineMenuBook } from "@react-icons/all-files/md/MdOutlineMenuBook";
import { IoWarning } from "@react-icons/all-files/io5/IoWarning";
import { RQAPI } from "features/apiClient/types";
import "./apiClientWarningPanel.scss";

export const ApiClientWarningPanel: React.FC<{
  warning: RQAPI.ExecutionWarning;
}> = ({ warning }) => {
  return (
    <div className="api-client-warning-panel-container">
      <div className="api-client-warning-panel-header">
        <IoWarning className="warning-icon" />
        <span className="api-client-warning-text">Warning:</span>
        <span className="api-client-warning-message">{warning.message}</span>
      </div>
      <div className="api-client-warning-panel-content">
        <div className="api-client-warning-panel-message">{warning.description}</div>
        <div className="api-client-error-panel-actions">
          <RQButton size="small" icon={<MdOutlineMenuBook />} />
        </div>
      </div>
    </div>
  );
};
