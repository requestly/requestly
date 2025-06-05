import React from "react";
import { AbortReason, RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";
import { UserAbortErrorView } from "./UserAbortErrorView";

interface AbortErrorProps {
  error: RQAPI.ExecutionError;
  onRetry: () => void;
  onDismiss: () => void;
}

export const AbortError: React.FC<AbortErrorProps> = ({ error, onRetry, onDismiss }) => {
  if (!error) {
    return null;
  }

  if (error.reason === AbortReason.USER_CANCELLED) {
    return <UserAbortErrorView error={error} handleDismiss={onDismiss} />;
  }
  return (
    <ApiClientErrorPlaceholder
      error={error}
      onRetry={onRetry}
      imageUrl="/assets/media/apiClient/abort-error.svg"
      showTitle={false}
    />
  );
};
