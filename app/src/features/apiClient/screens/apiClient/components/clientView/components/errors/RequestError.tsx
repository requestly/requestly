import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";

export const RequestError: React.FC<{ error: RQAPI.ExecutionError; onRetry: () => void }> = (props) => {
  return <ApiClientErrorPlaceholder imageUrl="/assets/media/apiClient/request-error.svg" {...props} />;
};
