import React, { useCallback, useEffect, useMemo, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { Skeleton } from "antd";
import "./apiClient.scss";
import { QueryParamsProvider } from "features/apiClient/store/QueryParamsContextProvider";
import { useParent } from "features/apiClient/store/apiRecords/useParent.hook";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
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

export const APIClient: React.FC<Props> = React.memo((props) => {
  const { isCreateMode, isHistoryMode } = props;
  const { history, selectedHistoryIndex, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>(props?.apiEntryDetails);

  const { version } = useParent(props?.apiEntryDetails?.id);
  const [getParent] = useAPIRecords((state) => [state.getParent]);

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

  useEffect(() => {
    const parent = getParent(entryDetails?.id);
    setSelectedEntryDetails((prev) => ({ ...prev, collectionId: parent }));
  }, [version, entryDetails?.id, getParent]);

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
        <AutogenerateProvider>
          <QueryParamsProvider entry={entryDetails?.data}>
            <APIClientView
              apiEntryDetails={entryDetails}
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
