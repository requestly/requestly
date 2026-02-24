import React from "react";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import "../apiClient.scss";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";

export type GenericApiClientOverride = {
  handleNameChange?: (name: string) => Promise<void> | void;
  onSaveClick?: {
    save: (record: RQAPI.ApiRecord, repositories: ApiClientRepositoryInterface) => Promise<RQAPI.ApiRecord> | void;
    onSuccess: (record: RQAPI.ApiRecord) => void;
    skipMarkSaved?: boolean;
  };
};

type Props = {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
  override?: GenericApiClientOverride;
  handleAppRequestFinished: (entry: RQAPI.ApiEntry) => void;
  isOpenInModal?: boolean;
};

export const GenericApiClient: React.FC<Props> = React.memo(
  ({ entity, override, handleAppRequestFinished, isOpenInModal = false }) => {
    return (
      <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
        <div className="api-client-container-content">
          <AutogenerateProvider>
            <AISessionProvider>
              <ClientViewFactory
                entity={entity}
                handleRequestFinished={handleAppRequestFinished}
                override={override}
                isOpenInModal={isOpenInModal}
              />
            </AISessionProvider>
          </AutogenerateProvider>
        </div>
      </BottomSheetProvider>
    );
  }
);
