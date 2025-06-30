import React from "react";
import APIClientView from "./components/clientView/APIClientView";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";
import "./apiClient.scss";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";

type Props = {
  apiEntryDetails?: RQAPI.ApiRecord;
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  handleAppRequestFinished?: (entry: RQAPI.Entry) => void;
  isCreateMode: boolean;
};

export const GenericApiClient: React.FC<Props> = React.memo(
  ({ apiEntryDetails, onSaveCallback, handleAppRequestFinished, isCreateMode }) => {
    return (
      <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
        <div className="api-client-container-content">
          <AutogenerateProvider>
            <QueryParamsProvider entry={apiEntryDetails?.data}>
              <APIClientView
                apiEntryDetails={apiEntryDetails}
                notifyApiRequestFinished={handleAppRequestFinished}
                onSaveCallback={onSaveCallback}
                isCreateMode={isCreateMode}
              />
            </QueryParamsProvider>
          </AutogenerateProvider>
        </div>
      </BottomSheetProvider>
    );
  }
);
