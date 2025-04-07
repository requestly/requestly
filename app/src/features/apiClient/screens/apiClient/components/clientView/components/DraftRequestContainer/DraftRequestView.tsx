import React from "react";
import { APIClient } from "../../../../APIClient";
import { RQAPI } from "features/apiClient/types";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
}> = (props) => {
  return <APIClient isCreateMode={true} {...props} />;
};
