import React, { useCallback, useState } from "react";
import APIClientSidebar, { NO_HISTORY_INDEX } from "./sidebar/APIClientSidebar";
import APIClientView from "./client-view/APIClientView";
import { RQAPI } from "./types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import { getEmptyAPIEntry } from "./apiUtils";
import {
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import "./apiClientContainer.scss";
import ImportRequestModal from "./ImportRequestModal";

interface Props {}

const APIClientContainer: React.FC<Props> = () => {
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(NO_HISTORY_INDEX);
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
    const newApiEntry: RQAPI.Entry = {
      request,
      response: null,
    };

    setSelectedEntry(newApiEntry);
    setSelectedHistoryIndex(NO_HISTORY_INDEX);
    setIsImportModalOpen(false);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onNewClick = useCallback(() => {
    setSelectedEntry(getEmptyAPIEntry());
    setSelectedHistoryIndex(NO_HISTORY_INDEX);
    trackNewRequestClicked();
  }, []);

  return (
    <div className="api-client-container">
      <APIClientSidebar
        history={history}
        selectedHistoryIndex={selectedHistoryIndex}
        setSelectedHistoryIndex={setSelectedHistoryIndex}
        clearHistory={clearHistory}
        onSelectionFromHistory={setSelectedEntry}
        onNewClick={onNewClick}
        onImportClick={onImportClick}
      />
      <APIClientView apiEntry={selectedEntry} notifyApiRequestFinished={addToHistory} />
      <ImportRequestModal
        isOpen={isImportModalOpen}
        handleImportRequest={handleImportRequest}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default APIClientContainer;
