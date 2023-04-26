import React, { useCallback, useState } from "react";
import APIsViewSidebar from "./sidebar/APIsViewSidebar";
import APIClientView from "./client/APIClientView";
import { RQAPI } from "./types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import "./apis.scss";

interface Props {}

const APIsView: React.FC<Props> = () => {
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();

  const addToHistory = useCallback((apiEntry: RQAPI.Entry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStore();
  }, [setHistory]);

  return (
    <div className="apis-view">
      <APIsViewSidebar history={history} clearHistory={clearHistory} onSelectionFromHistory={setSelectedEntry} />
      <APIClientView apiEntry={selectedEntry} notifyApiRequestFinished={addToHistory} />
    </div>
  );
};

export default APIsView;
