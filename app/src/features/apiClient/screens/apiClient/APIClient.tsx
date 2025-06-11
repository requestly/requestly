import React, { useCallback, useEffect, useMemo, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { QueryParamSyncType, RQAPI } from "features/apiClient/types";
import { Skeleton } from "antd";
import { syncQueryParams } from "./utils";
import "./apiClient.scss";
import { isEmpty } from "lodash";
import { useGenericState } from "hooks/useGenericState";

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

export const APIClient: React.FC<Props> = React.memo((props) => {
  const { isCreateMode, isHistoryMode } = props;
  const {
    apiClientRecords,
    history,
    selectedHistoryIndex,
    addToHistory,
    setCurrentHistoryIndex,
  } = useApiClientContext();
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>(props?.apiEntryDetails);

  const { setTitle } = useGenericState();

  const requestId = isCreateMode === false ? props.requestId : null;
  const onSaveCallback = props.onSaveCallback ?? (() => {});

  const requestHistoryEntry = useMemo(() => {
    if (!isHistoryMode) {
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
  }, [isHistoryMode, history, selectedHistoryIndex]);

  useEffect(() => {
    if (isCreateMode) {
      return;
    }

    const record = apiClientRecords.find((record) => record.id === requestId) as RQAPI.ApiRecord;

    if (record) {
      const entry = record.data;
      if (entry) {
        entry.request = {
          ...entry.request,
          ...syncQueryParams(
            entry.request.queryParams,
            entry.request.url,
            isEmpty(entry.request.queryParams) ? QueryParamSyncType.TABLE : QueryParamSyncType.SYNC
          ),
        };
      }
      record.data = entry;
      setSelectedEntryDetails(record);

      // To sync title for tabs opened from deeplinks
      if (!props.apiEntryDetails?.name) {
        setTitle(record.name);
      }
    }
  }, [apiClientRecords, isCreateMode, props.apiEntryDetails?.name, requestId, setTitle]);

  const entryDetails = useMemo(
    () => (isHistoryMode && !requestId ? requestHistoryEntry : selectedEntryDetails) as RQAPI.ApiRecord,
    [isHistoryMode, requestHistoryEntry, selectedEntryDetails, requestId]
  );

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      if (isHistoryMode) {
        setCurrentHistoryIndex(history.length);
      }
      addToHistory(entry);
    },
    [addToHistory, isHistoryMode, setCurrentHistoryIndex, history]
  );

  if (!entryDetails && !isCreateMode && !isHistoryMode) {
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
        <APIClientView
          apiEntryDetails={entryDetails}
          notifyApiRequestFinished={handleAppRequestFinished}
          onSaveCallback={onSaveCallback}
          isCreateMode={isCreateMode}
        />
      </div>
    </BottomSheetProvider>
  );
});
