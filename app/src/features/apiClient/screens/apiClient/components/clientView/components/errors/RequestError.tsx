import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";
import ApiClientFileMissingError from "./APIClientFileMissingError";

export const RequestError: React.FC<{ error: RQAPI.ExecutionError; onRetry: () => void }> = (props) => {
  if (props.error.type === RQAPI.ApiClientErrorType.MISSING_FILE) {
    return <ApiClientFileMissingError imageUrl="/assets/media/apiClient/file-error.svg" {...props} />;
  }

  return <ApiClientErrorPlaceholder imageUrl="/assets/media/apiClient/request-error.svg" {...props} />;
};
