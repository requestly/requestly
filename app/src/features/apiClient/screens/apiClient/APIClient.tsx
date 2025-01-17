import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { getApiRecord } from "backend/apiClient";
import Logger from "lib/logger";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = React.memo(() => {
  const location = useLocation();
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const { apiClientRecords, history, selectedHistoryIndex, addToHistory } = useApiClientContext();

  const [persistedRequestId, setPersistedRequestId] = useState<string>(() => requestId);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>();
  const isHistoryPath = location.pathname.includes("history");
  const isNewRequest = searchParams.has("new");

  useEffect(() => {
    if (isNewRequest) {
      setPersistedRequestId(requestId);
    }
  }, [isNewRequest, requestId]);

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
    //For updating breadcrumb name
    if (!persistedRequestId) {
      return;
    }

    const record = apiClientRecords[persistedRequestId];

    if (!record) {
      return;
    }

    setSelectedEntryDetails((prev) => {
      return prev?.id === record?.id && persistedRequestId === prev?.id
        ? ({ ...(prev ?? {}), name: record?.name, collectionId: record?.collectionId } as RQAPI.ApiRecord)
        : prev;
    });
  }, [persistedRequestId, apiClientRecords]);

  const isRequestFetched = useRef(false);
  useEffect(() => {
    if (isRequestFetched.current) {
      return;
    }

    if (!persistedRequestId) {
      return;
    }

    getApiRecord(persistedRequestId)
      .then((result) => {
        if (result.success) {
          isRequestFetched.current = true;

          if (result.data.type === RQAPI.RecordType.API) {
            setSelectedEntryDetails(result.data);
          }
        }
      })
      .catch((error) => {
        setSelectedEntryDetails(null);
        // TODO: redirect to new empty entry
        Logger.error("Error loading api record", error);
      })
      .finally(() => {});
  }, [persistedRequestId]);

  const entryDetails = useMemo(() => (isHistoryPath ? requestHistoryEntry : selectedEntryDetails) as RQAPI.ApiRecord, [
    isHistoryPath,
    requestHistoryEntry,
    selectedEntryDetails,
  ]);
  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.Entry) => {
      if (!isHistoryPath) addToHistory(entry);
    },
    [addToHistory, isHistoryPath]
  );
  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <APIClientView
          // TODO: Fix - "apiEntry" is used for history, remove this prop and derive everything from "apiEntryDetails"
          // key={persistedRequestId}
          apiEntry={entryDetails?.data}
          apiEntryDetails={entryDetails}
          notifyApiRequestFinished={handleAppRequestFinished}
        />
      </div>
    </BottomSheetProvider>
  );
});
