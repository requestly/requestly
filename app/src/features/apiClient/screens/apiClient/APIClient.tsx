import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getApiRecord, upsertApiRecord } from "backend/apiClient";
import Logger from "lib/logger";
import PATHS from "config/constants/sub/paths";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import "./apiClient.scss";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { onSaveRecord } = useApiClientContext();

  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedEntry, setSelectedEntry] = useState<RQAPI.Entry>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<RQAPI.ApiRecord>();

  useEffect(() => {
    if (!requestId) {
      return;
    }

    setSelectedEntry(null);
    setIsLoading(true);

    getApiRecord(requestId)
      .then((result) => {
        if (result.success) {
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

  const saveRequest = useCallback(
    async (apiEntry: RQAPI.Entry) => {
      setIsLoading(true);

      // Request body can be undefined, causes error while saving
      const updatedEntry = { ...apiEntry, request: { ...apiEntry.request, body: apiEntry.request.body ?? null } };

      const record: Partial<RQAPI.ApiRecord> = {
        type: RQAPI.RecordType.API,
        data: updatedEntry,
      };

      const result = await upsertApiRecord(uid, record, teamId);

      if (result.success) {
        onSaveRecord(result.data);
        navigate(`${PATHS.API_CLIENT.ABSOLUTE}/request/${result.data.id}`);
      }

      setIsLoading(false);
    },
    [uid, teamId, onSaveRecord, navigate]
  );

  const handleImportRequest = useCallback(
    async (request: RQAPI.Request) => {
      const apiEntry = getEmptyAPIEntry(request);

      return saveRequest(apiEntry)
        .then(() => {
          setSelectedEntry(apiEntry);
        })
        .finally(() => {
          setIsImportModalOpen(false);
        });
    },
    [saveRequest]
  );

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onNewClick = useCallback(() => {
    setSelectedEntry(getEmptyAPIEntry());
    setSelectedEntryDetails(null);
    navigate(PATHS.API_CLIENT.ABSOLUTE);
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
        <APIClientView
          key={requestId}
          apiEntry={selectedEntry ?? selectedEntryDetails?.data}
          apiEntryDetails={selectedEntryDetails}
          notifyApiRequestFinished={addToHistory}
        />
        <ImportRequestModal
          isRequestLoading={isLoading}
          isOpen={isImportModalOpen}
          handleImportRequest={handleImportRequest}
          onClose={() => setIsImportModalOpen(false)}
        />
      </>
    </div>
  );
};
