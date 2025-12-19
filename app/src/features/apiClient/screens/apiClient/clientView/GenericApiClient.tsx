import React from "react";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import "../apiClient.scss";

type Props = {
  apiEntryDetails: RQAPI.ApiRecord;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  handleAppRequestFinished: (entry: RQAPI.ApiEntry) => void;
  isCreateMode: boolean;
  isOpenInModal?: boolean;
};

export const GenericApiClient: React.FC<Props> = React.memo(
  ({ apiEntryDetails, onSaveCallback, handleAppRequestFinished, isCreateMode, isOpenInModal = false }) => {
    return (
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <ClientViewFactory
            apiRecord={apiEntryDetails}
            handleRequestFinished={handleAppRequestFinished}
            onSaveCallback={onSaveCallback}
            isCreateMode={isCreateMode}
            isOpenInModal={isOpenInModal}
          />
        </AutogenerateProvider>
      </div>
    );
  }
);
