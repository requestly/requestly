import React, { useCallback } from "react";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { Result } from "antd";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import "../apiClient.scss";
import { BottomSheetFeatureContext } from "componentsV2/BottomSheet/types";

type BaseProps = {
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryDetails?: RQAPI.ApiRecord;
  isHistoryMode?: boolean;
};

type CreateModeProps = BaseProps & {
  isCreateMode: true;
};

type EditModeProps = BaseProps & {
  isCreateMode: false;
  requestId: string;
};

type Props = CreateModeProps | EditModeProps;

export const ApiClientViewManager: React.FC<Props> = React.memo((props) => {
  const { isCreateMode, isHistoryMode } = props;
  const { history, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  const selectedEntryDetails = useApiRecord(isCreateMode ? "" : (props as EditModeProps).requestId);

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

  if (selectedEntryDetails.type === RQAPI.RecordType.COLLECTION) {
    return null;
  }

  if (!selectedEntryDetails.data) {
    return <Result status="error" title="Request not found" subTitle="Oops! Looks like this request doesn't exist." />;
  }

  return (
    <BottomSheetProvider context={BottomSheetFeatureContext.api_client}>
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <ClientViewFactory
            apiRecord={selectedEntryDetails}
            handleRequestFinished={handleAppRequestFinished}
            onSaveCallback={onSaveCallback}
            isCreateMode={isCreateMode}
          />
        </AutogenerateProvider>
      </div>
    </BottomSheetProvider>
  );
});
