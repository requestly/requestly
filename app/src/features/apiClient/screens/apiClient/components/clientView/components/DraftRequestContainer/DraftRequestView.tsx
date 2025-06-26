import React from "react";
import { RQAPI } from "features/apiClient/types";
import { GenericApiClient } from "features/apiClient/screens/apiClient/GenericApiClient";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
}> = (props) => {
  return <GenericApiClient isCreateMode {...props} />;
};
