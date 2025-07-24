import { RQAPI } from "features/apiClient/types";
import { HttpClientViewContainer } from "../components/views/http/HttpClientViewContainer";
import { GraphQLClientViewContainer } from "../components/views/graphql/GraphQLClientViewContainer";
import { isGraphQLApiRecord, isHttpApiRecord } from "../utils";

interface Props {
  apiRecord: RQAPI.ApiRecord;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  isCreateMode: boolean;
}

export const ClientViewFactory = ({ apiRecord, handleRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  if (isHttpApiRecord(apiRecord)) {
    return (
      <HttpClientViewContainer
        selectedEntryDetails={apiRecord}
        handleAppRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
      />
    );
  }

  if (isGraphQLApiRecord(apiRecord)) {
    return <GraphQLClientViewContainer />;
  }

  return (
    <HttpClientViewContainer
      selectedEntryDetails={apiRecord as RQAPI.HttpApiRecord}
      handleAppRequestFinished={handleRequestFinished}
      onSaveCallback={onSaveCallback}
      isCreateMode={isCreateMode}
    />
  );
};
