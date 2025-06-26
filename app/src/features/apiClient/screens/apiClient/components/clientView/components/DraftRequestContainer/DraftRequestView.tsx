import React from "react";
import { ApiClientViewManager } from "../../../../ApiClientViewManager";
import { RQAPI } from "features/apiClient/types";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
}> = (props) => {
  return <ApiClientViewManager isCreateMode={true} {...props} />;
};
