import React from "react";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import "../apiClient.scss";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";

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
      <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
        <div className="api-client-container-content">
          <AutogenerateProvider>
            <AISessionProvider>
              <ClientViewFactory
                apiRecord={apiEntryDetails}
                handleRequestFinished={handleAppRequestFinished}
                onSaveCallback={onSaveCallback}
                isCreateMode={isCreateMode}
                isOpenInModal={isOpenInModal}
              />
            </AISessionProvider>
          </AutogenerateProvider>
        </div>
      </BottomSheetProvider>
    );
  }
);
