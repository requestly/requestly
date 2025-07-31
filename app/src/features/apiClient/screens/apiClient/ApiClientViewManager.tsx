import React, { useCallback } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { Result } from "antd";
import "./apiClient.scss";
import { AutogenerateProvider } from "features/apiClient/store/autogenerateContextProvider";

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
  const selectedEntryDetails = useApiRecord(props?.apiEntryDetails?.id);

  const onSaveCallback = props.onSaveCallback ?? (() => {});
  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      if (isHistoryMode) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryMode, setCurrentHistoryIndex, history]
  );

  if (!selectedEntryDetails.data) {
    return <Result status="error" title="Request not found" subTitle="Oops! Looks like this request doesn't exist." />;
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <AutogenerateProvider>
          <QueryParamsProvider entry={selectedEntryDetails?.data as RQAPI.Entry}>
            <APIClientView
              apiEntryDetails={selectedEntryDetails as RQAPI.ApiRecord}
              notifyApiRequestFinished={handleAppRequestFinished}
              onSaveCallback={onSaveCallback}
              isCreateMode={isCreateMode}
            />
          </QueryParamsProvider>
        </AutogenerateProvider>
      </div>
    </BottomSheetProvider>
  );
});
