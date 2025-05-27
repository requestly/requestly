import React from "react";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import "./ErrorPlaceholder/errorPlaceholder.scss";

interface UserAbortErrorViewProps {
  error: RQAPI.ExecutionError;
  handleDismiss: () => void;
}

export const UserAbortErrorView: React.FC<UserAbortErrorViewProps> = ({ error, handleDismiss }) => {
  return (
    <div className="api-client-error-placeholder-container">
      <div className="api-client-error-placeholder-content">
        <img src="/assets/media/apiClient/abort-error.svg" alt="Error card" width={80} height={80} />
        <div className="error-container">
          <span className="error-message">{error.message}</span>
        </div>
        <RQButton type="primary" onClick={handleDismiss}>
          Got it
        </RQButton>
      </div>
    </div>
  );
};
