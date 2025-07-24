import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";
import HttpClientView from "./HttpClientView";
import { RQAPI } from "features/apiClient/types";

interface Props {
  selectedEntryDetails: RQAPI.HttpApiRecord;
  handleAppRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  isCreateMode: boolean;
}

export const HttpClientViewContainer = ({
  selectedEntryDetails,
  handleAppRequestFinished,
  onSaveCallback,
  isCreateMode,
}: Props) => {
  return (
    <QueryParamsProvider entry={selectedEntryDetails?.data}>
      <HttpClientView
        apiEntryDetails={selectedEntryDetails}
        notifyApiRequestFinished={handleAppRequestFinished}
        onSaveCallback={onSaveCallback}
        isCreateMode={isCreateMode}
      />
    </QueryParamsProvider>
  );
};
