import React from "react";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import "../apiClient.scss";

type Props = {
  apiEntryDetails?: RQAPI.ApiRecord;
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  handleAppRequestFinished?: (entry: RQAPI.ApiEntry) => void;
  isCreateMode: boolean;
};

export const GenericApiClient: React.FC<Props> = React.memo(
  ({ apiEntryDetails, onSaveCallback, handleAppRequestFinished, isCreateMode }) => {
    return (
      <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
        <div className="api-client-container-content">
          <AutogenerateProvider>
            <ClientViewFactory
              apiRecord={apiEntryDetails}
              handleRequestFinished={handleAppRequestFinished}
              onSaveCallback={onSaveCallback}
              isCreateMode={isCreateMode}
            />
          </AutogenerateProvider>
        </div>
      </BottomSheetProvider>
    );
  }
);
