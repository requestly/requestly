import React, { useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryType: RQAPI.ApiEntryType;
}> = ({ onSaveCallback, apiEntryType }) => {
  const apiEntryDetails = useMemo(() => getEmptyDraftApiRecord(apiEntryType), [apiEntryType]);

  return (
    <GenericApiClient
      isCreateMode
      apiEntryDetails={apiEntryDetails}
      onSaveCallback={onSaveCallback}
      handleAppRequestFinished={() => {}}
    />
  );
};
