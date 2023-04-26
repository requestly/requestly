import React, { useCallback, useState } from "react";
import APIsViewSidebar from "./sidebar/APIsViewSidebar";
import APIClientView from "./client/APIClientView";
import { RQAPI } from "./types";
import "./apis.scss";

interface Props {}

const APIsView: React.FC<Props> = () => {
  const [history, setHistory] = useState<RQAPI.Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();

  const logRequest = useCallback((apiEntry: RQAPI.Entry) => {
    setHistory((history) => [...history, apiEntry]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="apis-view">
      <APIsViewSidebar history={history} clearHistory={clearHistory} onSelectionFromHistory={setSelectedEntry} />
      <APIClientView apiEntry={selectedEntry} notifyApiRequestFinished={logRequest} />
    </div>
  );
};

export default APIsView;
