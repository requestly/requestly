import React, { useCallback } from "react";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { Result } from "antd";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";
import { AISessionProvider } from "features/ai/contexts/AISession";
import "../apiClient.scss";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectRecordById } from "features/apiClient/slices";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

type BaseProps = {
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryDetails?: RQAPI.ApiRecord;
  isHistoryMode?: boolean;
  requestId: string;
};

type CreateModeProps = BaseProps & {
  isCreateMode: true;
};

type EditModeProps = BaseProps & {
  isCreateMode: false;
};

type Props = BaseProps;
// CreateModeProps | EditModeProps;

export const ApiClientViewManager: React.FC<Props> = React.memo((props) => {
  const { requestId, isHistoryMode } = props;
  const recordType = useApiClientSelector(s => (selectRecordById(s, requestId)?.data as RQAPI.ApiEntry).type);
  const entityType = recordType === RQAPI.ApiEntryType.HTTP ? ApiClientEntityType.HTTP_RECORD : ApiClientEntityType.GRAPHQL_RECORD
  const entity = useBufferedEntity({
    id: requestId,
    type: entityType
  });
  const { history, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  // const selectedEntryDetails = useApiRecord(isCreateMode ? "" : (props as EditModeProps).requestId);

  const onSaveCallback = props.onSaveCallback ?? (() => {});
  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      if (isHistoryMode) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryMode, setCurrentHistoryIndex, history.length]
  );

  // if (selectedEntryDetails.type === RQAPI.RecordType.COLLECTION) {
  //   return null;
  // }

  // if (!selectedEntryDetails.data) {
  //   return <Result status="error" title="Request not found" subTitle="Oops! Looks like this request doesn't exist." />;
  // }

  return (
    <BottomSheetProvider context={BottomSheetFeatureContext.API_CLIENT}>
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <AISessionProvider>
            <ClientViewFactory
              entity={entity}
              // apiRecord={selectedEntryDetails}
              handleRequestFinished={handleAppRequestFinished}
              onSaveCallback={onSaveCallback}
              // isCreateMode={isCreateMode}
            />
          </AISessionProvider>
        </AutogenerateProvider>
      </div>
    </BottomSheetProvider>
  );
});
