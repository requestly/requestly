import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { QueryParamSyncType, RQAPI } from "features/apiClient/types";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import Logger from "lib/logger";
import { Skeleton } from "antd";
import { getEmptyAPIEntry, syncQueryParams } from "./utils";
import "./apiClient.scss";
import { isEmpty } from "lodash";

interface Props {
  isCreateMode: boolean;
  requestId?: string;
  onSaveCallback?: (requestId: string) => void;
}

export const APIClient: React.FC<Props> = React.memo((props) => {
  const location = useLocation();
  const { requestId, isCreateMode } = props;
  // const { requestId } = useParams();
  // const [searchParams] = useSearchParams();
  const {
    apiClientRecords,
    history,
    selectedHistoryIndex,
    addToHistory,
    apiClientRecordsRepository,
  } = useApiClientContext();
  const [persistedRequestId, setPersistedRequestId] = useState<string>(() => requestId);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>(props?.entry);
  const isHistoryPath = location.pathname.includes("history");
  // const isNewRequest = searchParams.has("new");
  // const isCreateMode = searchParams.has("create");

  useEffect(() => {
    if (requestId) {
      setPersistedRequestId(requestId);
    }
  }, [requestId]);

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

  useEffect(() => {
    console.log("e1 start");
    //For updating breadcrumb name
    if (!persistedRequestId) {
      return;
    }

    console.log("e2 start");
    const record = apiClientRecords.find((rec) => rec.id === persistedRequestId);
    console.log("e2", record);
    if (!record) {
      return;
    }

    console.log("e3 start");
    setSelectedEntryDetails((prev) => {
      console.log("e3", prev, record);
      return prev?.id === record?.id && persistedRequestId === prev?.id
        ? ({ ...(prev ?? {}), name: record?.name, collectionId: record?.collectionId } as RQAPI.ApiRecord)
        : prev;
    });
    console.log("e3 end");
  }, [persistedRequestId, apiClientRecords]);

  const isRequestFetched = useRef(false);
  useEffect(() => {
    if (isCreateMode) {
      return;
    }

    if (isRequestFetched.current) {
      return;
    }

    if (!persistedRequestId) {
      return;
    }

    apiClientRecordsRepository
      .getRecord(persistedRequestId)
      .then((result) => {
        console.log("OLA", { result });
        if (result.success) {
          isRequestFetched.current = true;

          if (result.data.type === RQAPI.RecordType.API) {
            setSelectedEntryDetails(result.data);
          }
        }
      })
      .catch((error) => {
        console.error("aaa", error);
        setSelectedEntryDetails(null);
        // TODO: redirect to new empty entry
        Logger.error("Error loading api record", error);
      })
      .finally(() => {});
  }, [persistedRequestId, isCreateMode, apiClientRecordsRepository]);

  const entryDetails = useMemo(() => (isHistoryPath ? requestHistoryEntry : selectedEntryDetails) as RQAPI.ApiRecord, [
    isHistoryPath,
    requestHistoryEntry,
    selectedEntryDetails,
  ]);

  const entryDetailsToView = useMemo(() => {
    if (isCreateMode) {
      return getEmptyAPIEntry();
    }

    const entry = entryDetails?.data;
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
    return entry;
  }, [isCreateMode, entryDetails?.data]);

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      if (!isHistoryPath) addToHistory(entry);
    },
    [addToHistory, isHistoryPath]
  );

  useEffect(() => {
    console.log("!!!debug", "entrydetailstoview", {
      entryDetailsToView,
    });
  }, [entryDetailsToView]);

  if (!entryDetailsToView) {
    return (
      <>
        <Skeleton className="api-client-header-skeleton" paragraph={{ rows: 1, width: "100%" }} />
        <Skeleton className="api-client-body-skeleton" />
      </>
    );
  }

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.RIGHT} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <APIClientView
          // TODO: Fix - "apiEntry" is used for history, remove this prop and derive everything from "apiEntryDetails"
          // key={persistedRequestId}
          apiEntry={entryDetailsToView}
          apiEntryDetails={entryDetails}
          notifyApiRequestFinished={handleAppRequestFinished}
          onSaveCallback={props.onSaveCallback}
          isCreateMode={isCreateMode}
        />
      </div>
    </BottomSheetProvider>
  );
});
