import React from "react";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import "../apiClient.scss";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { HttpClientViewProps } from "../components/views/http/HttpClientView";

type Props = {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity,
  override?: HttpClientViewProps['override'],
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
