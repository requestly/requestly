import React from "react";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "../../../../clientView/ClientViewFactory";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";
import "../../../../apiClient.scss";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectRecordById } from "features/apiClient/slices";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

type Props = {
  exampleId: string;
};

export const ExampleRequestView: React.FC<Props> = React.memo(({ exampleId }) => {
  const record = useApiClientSelector((s) => selectRecordById(s, exampleId) as RQAPI.ExampleApiRecord | undefined);

  const entityType =
    record?.data?.type === RQAPI.ApiEntryType.GRAPHQL
      ? ApiClientEntityType.GRAPHQL_RECORD
      : ApiClientEntityType.HTTP_RECORD;

  const entity = useBufferedEntity({
    id: exampleId,
    type: entityType,
  });

  if (!record) return null;

  return (
    <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <AISessionProvider>
            <ClientViewFactory entity={entity} handleRequestFinished={() => {}} />
          </AISessionProvider>
        </AutogenerateProvider>
      </div>
    </BottomSheetProvider>
  );
});
