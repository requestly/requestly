import React from "react";
import { ApiClientViewManager } from "../../../../clientView/ApiClientViewManager";
import { RQAPI } from "features/apiClient/types";

export const RequestView: React.FC<{ apiEntryDetails?: RQAPI.ApiRecord; requestId: string }> = (props) => {
  return <ApiClientViewManager isCreateMode={false} {...props} />;
};
