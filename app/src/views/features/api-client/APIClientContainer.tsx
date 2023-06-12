import React, { useCallback, useState } from "react";
import APIClientSidebar from "./sidebar/APIClientSidebar";
import APIClientView from "./client-view/APIClientView";
import { RQAPI } from "./types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "./historyStore";
import { getEmptyAPIEntry } from "./apiUtils";
import {
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import ImportRequestModal from "./ImportRequestModal";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import { isExtensionInstalled } from "actions/ExtensionActions";
import "./apiClientContainer.scss";

interface Props {}

const APIClientContainer: React.FC<Props> = () => {
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
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
      {isFeatureCompatible(FEATURES.API_CLIENT) ? (
        <>
          <APIClientSidebar
            history={history}
            onSelectionFromHistory={onSelectionFromHistory}
            clearHistory={clearHistory}
            onNewClick={onNewClick}
            onImportClick={onImportClick}
          />
          <APIClientView apiEntry={selectedEntry} notifyApiRequestFinished={addToHistory} />
          <ImportRequestModal
            isOpen={isImportModalOpen}
            handleImportRequest={handleImportRequest}
            onClose={() => setIsImportModalOpen(false)}
          />
        </>
      ) : isExtensionInstalled() ? (
        <InstallExtensionCTA
          heading={"Get Started"}
          subHeadingExtension={"You need to be on the latest version of the extension to use API Client."}
          isUpdateRequired
          eventPage="api-client"
        />
      ) : (
        <InstallExtensionCTA
          heading={"Get Started"}
          subHeadingExtension={"Start testing API endpoints"}
          eventPage="api-client"
        />
      )}
    </div>
  );
};

export default APIClientContainer;
