import React, { useCallback, useMemo, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useLocation } from "react-router-dom";
import { Skeleton } from "antd";
import "./apiClient.scss";
import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";

type BaseProps = {
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  apiEntryDetails?: RQAPI.ApiRecord;
};

type CreateModeProps = BaseProps & {
  isCreateMode: true;
};

type EditModeProps = BaseProps & {
  isCreateMode: false;
  requestId: string;
};

type HistoryModeProps = BaseProps & {
  isCreateMode: false;
  requestId?: string;
};

type Props = CreateModeProps | EditModeProps | HistoryModeProps;

export const APIClient: React.FC<Props> = React.memo((props) => {
  const location = useLocation();
  const { isCreateMode } = props;
  const { history, selectedHistoryIndex, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  const [selectedEntryDetails] = useState<RQAPI.ApiRecord>(props?.apiEntryDetails);
  const isHistoryPath = location.pathname.includes("history");

  const requestId = isCreateMode === false ? props.requestId : null;
  const onSaveCallback = props.onSaveCallback ?? (() => {});

  const requestHistoryEntry = useMemo(() => {
    if (!isHistoryPath) {
      return;
    }

    if (history?.length === 0) {
      return;
    }

    const entryDetails: Partial<RQAPI.ApiRecord> = {
      type: RQAPI.RecordType.API,
      data: { ...history[selectedHistoryIndex] },
    };

    return entryDetails;
  }, [isHistoryPath, history, selectedHistoryIndex]);

  const entryDetails = useMemo(
    () => (isHistoryPath && !requestId ? requestHistoryEntry : selectedEntryDetails) as RQAPI.ApiRecord,
    [isHistoryPath, requestHistoryEntry, selectedEntryDetails, requestId]
  );

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      if (isHistoryPath) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryPath, setCurrentHistoryIndex, history]
  );

  if (!entryDetails && !isCreateMode && !isHistoryPath) {
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
        <QueryParamsProvider entry={entryDetails?.data}>
          <APIClientView
            apiEntryDetails={entryDetails}
            notifyApiRequestFinished={handleAppRequestFinished}
            onSaveCallback={onSaveCallback}
            isCreateMode={isCreateMode}
          />
        </QueryParamsProvider>
      </div>
    </BottomSheetProvider>
  );
});
