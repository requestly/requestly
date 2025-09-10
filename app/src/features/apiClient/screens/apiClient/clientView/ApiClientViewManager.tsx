import React, { useCallback } from "react";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { Result } from "antd";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";
import { ClientViewFactory } from "./ClientViewFactory";
import "../apiClient.scss";

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
  const id = isCreateMode ? "" : (props as EditModeProps).requestId
  console.log("DG-2.0: ", JSON.stringify({id}, null, 2))
  const selectedEntryDetails = useApiRecord(id);

  console.log("DG-2.1: ", JSON.stringify({id, selectedEntryDetails}, null, 2))

  const onSaveCallback = props.onSaveCallback ?? (() => {});
  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      if (isHistoryMode) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryMode, setCurrentHistoryIndex, history]
  );

  if (selectedEntryDetails.type === RQAPI.RecordType.COLLECTION) return null;

  if (!selectedEntryDetails.data) {
    return <Result status="error" title="Request not found" subTitle="Oops! Looks like this request doesn't exist." />;
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
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
