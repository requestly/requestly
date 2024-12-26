import React, { useEffect, useMemo, useRef, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useLocation, useParams } from "react-router-dom";
import { getApiRecord } from "backend/apiClient";
import Logger from "lib/logger";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const location = useLocation();
  const { requestId } = useParams();
  const { apiClientRecords, history, selectedHistoryIndex, addToHistory } = useApiClientContext();

  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>();
  const isHistoryPath = location.pathname.includes("history");

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

  const isRequestFetched = useRef(false);

  useEffect(() => {
    //For updating breadcrumb name
    if (!requestId || requestId === "new") {
      return;
    }

    const record = apiClientRecords.find((rec) => rec.id === requestId);

    if (!record) {
      return;
    }

    setSelectedEntryDetails((prev) => {
      return prev?.id === record?.id ? ({ ...(prev ?? {}), name: record?.name } as RQAPI.ApiRecord) : prev;
    });
  }, [requestId, apiClientRecords]);

  useEffect(() => {
    if (isRequestFetched.current) {
      return;
    }

    if (!requestId || requestId === "new") {
      return;
    }
    getApiRecord(requestId)
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
  }, [requestId]);

  const entryDetails = (isHistoryPath ? requestHistoryEntry : selectedEntryDetails) as RQAPI.ApiRecord;

  return (
    <BottomSheetProvider defaultPlacement={BottomSheetPlacement.BOTTOM} isSheetOpenByDefault={true}>
      <div className="api-client-container-content">
        <APIClientView
          // TODO: Fix - "apiEntry" is used for history, remove this prop and derive everything from "apiEntryDetails"
          apiEntry={entryDetails?.data}
          apiEntryDetails={entryDetails}
          notifyApiRequestFinished={addToHistory}
        />
      </div>
    </BottomSheetProvider>
  );
};
