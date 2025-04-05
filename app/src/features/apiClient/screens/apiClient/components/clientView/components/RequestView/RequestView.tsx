import React from "react";
import { APIClient } from "../../../../APIClient";
import { RQAPI } from "features/apiClient/types";

export const RequestView: React.FC<{ apiEntryDetails?: RQAPI.ApiRecord; requestId: string }> = (props) => {
  return <APIClient isCreateMode={false} {...props} />;
};
