import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ApiClientErrorPlaceholder } from "./ErrorPlaceholder/ErrorPlaceholder";

export const RequestError: React.FC<{ error: RQAPI.ExecutionError }> = ({ error }) => {
  return <ApiClientErrorPlaceholder error={error} imageUrl="/assets/media/apiClient/requestError.png" />;
};
