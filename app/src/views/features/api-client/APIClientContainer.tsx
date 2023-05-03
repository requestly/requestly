import React, { useCallback, useState } from "react";
import APIClientSidebar from "./sidebar/APIClientSidebar";
import APIClientView from "./client-view/APIClientView";
import { RQAPI } from "./types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import { Input, Modal } from "antd";
import { getEmptyAPIEntry, parseCurlRequest } from "./apiUtils";
import { toast } from "utils/Toast";
import "./apiClientContainer.scss";

interface Props {}

const APIClientContainer: React.FC<Props> = () => {
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
    if (!requestFromCurl || !requestFromCurl.url) {
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
    <div className="api-client-container">
      <APIClientSidebar
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

export default APIClientContainer;
