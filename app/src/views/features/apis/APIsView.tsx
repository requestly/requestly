import React, { useCallback, useState } from "react";
import APIsViewSidebar from "./sidebar/APIsViewSidebar";
import APIClientView from "./client/APIClientView";
import { RQAPI } from "./types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import "./apis.scss";
import { Input, Modal } from "antd";
import { getEmptyAPIEntry, parseCurlRequest } from "./apiUtils";
import { toast } from "utils/Toast";

interface Props {}

const APIsView: React.FC<Props> = () => {
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [curlCommand, setCurlCommand] = useState("");

  const addToHistory = useCallback((apiEntry: RQAPI.Entry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStore();
  }, [setHistory]);

  const onImportFromCurl = useCallback(() => {
    const requestFromCurl: RQAPI.Request = parseCurlRequest(curlCommand);
    if (!requestFromCurl) {
      toast.error("Could not process the cURL command");
      return;
    }

    const newApiEntry: RQAPI.Entry = {
      request: requestFromCurl,
      response: null,
    };

    addToHistory(newApiEntry);
    setIsImportModalOpen(false);
    setCurlCommand("");
  }, [addToHistory, curlCommand]);

  const onNewClick = useCallback(() => {
    addToHistory(getEmptyAPIEntry());
  }, [addToHistory]);

  return (
    <div className="apis-view">
      <APIsViewSidebar
        history={history}
        clearHistory={clearHistory}
        onSelectionFromHistory={setSelectedEntry}
        onNewClick={onNewClick}
        onImportClick={() => setIsImportModalOpen(true)}
      />
      <APIClientView apiEntry={selectedEntry} notifyApiRequestFinished={addToHistory} />
      <Modal
        className="import-modal"
        centered
        title="Import from cURL"
        open={isImportModalOpen}
        okText="Import"
        onOk={onImportFromCurl}
        onCancel={() => setIsImportModalOpen(false)}
        width="70%"
      >
        <Input.TextArea
          className="curl-command-input"
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
          placeholder="curl https://example.com"
        />
      </Modal>
    </div>
  );
};

export default APIsView;
