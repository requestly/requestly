import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";

export const AbortError: React.FC<{ error: RQAPI.ExecutionError; onRetry: () => void }> = (props) => {
  return <ApiClientErrorPlaceholder imageUrl="/assets/media/apiClient/abort-error.svg" showTitle={false} {...props} />;
};
