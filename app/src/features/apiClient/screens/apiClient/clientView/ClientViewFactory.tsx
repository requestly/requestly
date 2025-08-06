import { RQAPI } from "features/apiClient/types";
import { isGraphQLApiRecord, isHttpApiRecord } from "../utils";
import GraphQLClientView from "../components/views/graphql/GraphQLClientView";
import HttpClientView from "../components/views/http/HttpClientView";

interface Props {
  apiRecord: RQAPI.ApiRecord;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  isCreateMode: boolean;
}

export const ClientViewFactory = ({ apiRecord, handleRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  if (isHttpApiRecord(apiRecord)) {
    return (
      <HttpClientView
        selectedEntryDetails={apiRecord}
        notifyApiRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
      />
    );
  }

  if (isGraphQLApiRecord(apiRecord)) {
    return (
      <GraphQLClientView
        selectedEntryDetails={apiRecord}
        notifyApiRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
      />
    );
  }

  return (
    <HttpClientView
      apiEntryDetails={apiRecord as RQAPI.HttpApiRecord}
      notifyApiRequestFinished={handleRequestFinished}
      onSaveCallback={onSaveCallback}
      isCreateMode={isCreateMode}
    />
  );
};
