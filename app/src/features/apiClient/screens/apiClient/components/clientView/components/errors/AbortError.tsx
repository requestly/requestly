import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";

export const AbortError: React.FC<{ error: RQAPI.ExecutionError }> = ({ error }) => {
  return (
    <ApiClientErrorPlaceholder error={error} imageUrl="/assets/media/apiClient/abort-error.svg" showTitle={false} />
  );
};
