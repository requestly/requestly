import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import APIClientSidebar from "./components/sidebar/APIClientSidebar";
import APIClientView from "./components/clientView/APIClientView";
import { RQAPI } from "../../types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import { getEmptyAPIEntry } from "./utils";
import {
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import ImportRequestModal from "./components/modals/ImportRequestModal";
import { getApiRecord } from "backend/apiClient";
import Logger from "lib/logger";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const { requestId } = useParams();

  const [, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    setIsLoading(true);

    getApiRecord(requestId)
      .then((result) => {
        if (result.success) {
          if (result.data.type === RQAPI.RecordType.API) {
            setSelectedEntry(result.data.data);
          }
        }
      })
      .catch((error) => {
        setSelectedEntry(null);
        // TODO: redirect to new empty entry
        Logger.error("Error loading api record", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [requestId]);

  const addToHistory = useCallback((apiEntry: RQAPI.Entry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStore();
    trackHistoryCleared();
  }, [setHistory]);

  const handleImportRequest = useCallback((request: RQAPI.Request) => {
    setSelectedEntry(getEmptyAPIEntry(request));
    setIsImportModalOpen(false);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onNewClick = useCallback(() => {
    setSelectedEntry(getEmptyAPIEntry());
    trackNewRequestClicked();
  }, []);

  const onSelectionFromHistory = useCallback(
    (index: number) => {
      setSelectedEntry(history[index]);
    },
    [history]
  );

  return (
    <div className="api-client-container">
      <>
        <APIClientSidebar
          history={history}
          onSelectionFromHistory={onSelectionFromHistory}
          clearHistory={clearHistory}
          onNewClick={onNewClick}
          onImportClick={onImportClick}
        />
        <APIClientView key={requestId} apiEntry={selectedEntry} notifyApiRequestFinished={addToHistory} />
        <ImportRequestModal
          isOpen={isImportModalOpen}
          handleImportRequest={handleImportRequest}
          onClose={() => setIsImportModalOpen(false)}
        />
      </>
    </div>
  );
};
