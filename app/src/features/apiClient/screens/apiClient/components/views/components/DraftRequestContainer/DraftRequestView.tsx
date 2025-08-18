import React from "react";
import { RQAPI } from "features/apiClient/types";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryType: RQAPI.ApiEntryType;
}> = ({ onSaveCallback, apiEntryType }) => {
  const apiEntryDetails: RQAPI.ApiRecord = getEmptyDraftApiRecord(apiEntryType);
  return <GenericApiClient isCreateMode onSaveCallback={onSaveCallback} apiEntryDetails={apiEntryDetails} />;
};
