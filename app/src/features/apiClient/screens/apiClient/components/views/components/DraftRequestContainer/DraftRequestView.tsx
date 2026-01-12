import React from "react";
import { RQAPI } from "features/apiClient/types";
import { DraftHttpRequestView } from "./DraftHttpRequestView";
import { DraftGraphQLRequestView } from "./DraftGraphQLRequestView";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryType: RQAPI.ApiEntryType;
}> = ({ onSaveCallback, apiEntryType }) => {
  if (apiEntryType === RQAPI.ApiEntryType.HTTP) {
    return <DraftHttpRequestView onSaveCallback={onSaveCallback} />;
  }

  if (apiEntryType === RQAPI.ApiEntryType.GRAPHQL) {
    return <DraftGraphQLRequestView onSaveCallback={onSaveCallback} />;
  }

  return null;
};
