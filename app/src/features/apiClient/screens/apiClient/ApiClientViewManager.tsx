import React, { useCallback } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { Skeleton } from "antd";
import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";
import { useSelf } from "features/apiClient/hooks/useSelf.hook";
import "./apiClient.scss";

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
  const selectedEntryDetails = useSelf(props?.apiEntryDetails?.id);

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

  if (!selectedEntryDetails && !isCreateMode && !isHistoryMode) {
    return (
      <>
        <Skeleton className="api-client-header-skeleton" paragraph={{ rows: 1, width: "100%" }} />
        <Skeleton className="api-client-body-skeleton" />
      </>
    );
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <QueryParamsProvider entry={selectedEntryDetails?.data as RQAPI.Entry}>
          <APIClientView
            apiEntryDetails={selectedEntryDetails as RQAPI.ApiRecord}
            notifyApiRequestFinished={handleAppRequestFinished}
            onSaveCallback={onSaveCallback}
            isCreateMode={isCreateMode}
          />
        </QueryParamsProvider>
      </div>
    </BottomSheetProvider>
  );
});
