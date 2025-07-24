import { RQAPI } from "features/apiClient/types";
import { HttpClientViewContainer } from "../components/views/http/HttpClientViewContainer";
import { GraphQLClientViewContainer } from "../components/views/graphql/GraphQLClientViewContainer";

interface Props {
  apiRecord: RQAPI.ApiRecord;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  isCreateMode: boolean;
}

export const ClientViewFactory = ({ apiRecord, handleRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  switch (apiRecord.data.type) {
    case RQAPI.ApiEntryType.HTTP:
      return (
        <HttpClientViewContainer
          selectedEntryDetails={apiRecord as RQAPI.HttpApiRecord}
          handleAppRequestFinished={handleRequestFinished}
          onSaveCallback={onSaveCallback}
          isCreateMode={isCreateMode}
        />
      );
    case RQAPI.ApiEntryType.GRAPHQL:
      return <GraphQLClientViewContainer />;
    default:
      return (
        <HttpClientViewContainer
          selectedEntryDetails={apiRecord as RQAPI.HttpApiRecord}
          handleAppRequestFinished={handleRequestFinished}
          onSaveCallback={onSaveCallback}
          isCreateMode={isCreateMode}
        />
      );
  }
};
