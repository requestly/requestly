import React from "react";
import { GraphQLRecordProvider } from "features/apiClient/store/graphqlRecord/GraphQLRecordContextProvider";
import { RQAPI } from "features/apiClient/types";
import { GraphQLClientView } from "./GraphQLClientView";

interface Props {
  selectedEntryDetails: RQAPI.GraphQLApiRecord;
  handleAppRequestFinished: (entry: RQAPI.GraphQLApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.GraphQLApiRecord) => void;
  isCreateMode: boolean;
}

export const GraphQLClientViewContainer: React.FC<Props> = ({
  selectedEntryDetails,
  handleAppRequestFinished,
  onSaveCallback,
  isCreateMode,
}) => {
  return (
    <GraphQLRecordProvider record={selectedEntryDetails}>
      <GraphQLClientView
        notifyApiRequestFinished={handleAppRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
      />
    </GraphQLRecordProvider>
  );
};
