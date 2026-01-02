import { RQAPI } from "features/apiClient/types";
import { isGraphQLApiRecord, isHttpApiRecord } from "../utils";
import GraphQLClientView from "../components/views/graphql/GraphQLClientView";
import HttpClientView from "../components/views/http/HttpClientView";
import { HttpClientViewCreateMode } from "../components/views/http/HttpClientViewCreateMode";

interface Props {
  apiRecord: RQAPI.ApiRecord;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  isCreateMode: boolean;
  isOpenInModal?: boolean;
  isHistoryView?: boolean;
}

export const ClientViewFactory = ({
  apiRecord,
  handleRequestFinished,
  onSaveCallback,
  isCreateMode,
  isOpenInModal,
  isHistoryView = false,
}: Props) => {
  if (isHttpApiRecord(apiRecord)) {
    if (isCreateMode) {
      return (
        <HttpClientViewCreateMode
          apiEntryDetails={apiRecord as RQAPI.HttpApiRecord}
          onSaveCallback={onSaveCallback}
          openInModal={isOpenInModal}
          notifyApiRequestFinished={handleRequestFinished}
          isHistoryView={isHistoryView}
        />
      );
    }

    return (
      <HttpClientView
        apiEntryDetails={apiRecord}
        notifyApiRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
        openInModal={isOpenInModal}
        isHistoryView={isHistoryView}
      />
    );
  }

  if (isGraphQLApiRecord(apiRecord)) {
    return (
      <GraphQLClientView
        recordId={apiRecord.id}
        apiEntryDetails={apiRecord}
        notifyApiRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
        openInModal={isOpenInModal}
        isHistoryView={isHistoryView}
      />
    );
  }

  return (
    <HttpClientView
      apiEntryDetails={apiRecord as RQAPI.HttpApiRecord}
      notifyApiRequestFinished={handleRequestFinished}
      onSaveCallback={onSaveCallback}
      isCreateMode={isCreateMode}
      openInModal={isOpenInModal}
      isHistoryView={isHistoryView}
    />
  );
};
