import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import APIClientView from "./components/clientView/APIClientView";
import { ImportRequestModal } from "./components/modals";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetPlacement, BottomSheetProvider } from "componentsV2/BottomSheet";
import { RQAPI } from "features/apiClient/types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getEmptyAPIEntry } from "./utils";
import { getApiRecord, upsertApiRecord } from "backend/apiClient";
import Logger from "lib/logger";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToRequest } from "utils/RedirectionUtils";
import "./apiClient.scss";
import { getActiveWorkspaceId } from "features/workspaces/utils";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";

interface Props {}

export const APIClient: React.FC<Props> = () => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));

  const location = useLocation();
  const { requestId } = useParams();
  const {
    apiClientRecords,
    history,
    selectedHistoryIndex,
    addToHistory,
    isImportModalOpen,
    onImportRequestModalClose,
    onSaveRecord,
    setIsImportModalOpen,
  } = useApiClientContext();

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
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
    if (!requestId || requestId == "new") {
      return;
    }
    const record = apiClientRecords.find((rec) => rec.id == requestId);
    if (record?.type === RQAPI.RecordType.API) {
      setSelectedEntryDetails((prev) => {
        if (prev?.id === record.id && prev.name == record.name) {
          return prev;
        }
        return record as RQAPI.ApiRecord;
      });
    }
  }, [requestId, apiClientRecords]);

  useEffect(() => {
    if (isRequestFetched.current) {
      return;
    }

    if (!requestId || requestId === "new") {
      return;
    }
    setIsLoading(true);
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
      .finally(() => {
        setIsLoading(false);
      });
  }, [requestId]);

  const saveRequest = useCallback(
    async (apiEntry: RQAPI.Entry) => {
      if (!user?.loggedIn) {
        return;
      }

      setIsLoading(true);

      const record: Partial<RQAPI.ApiRecord> = {
        type: RQAPI.RecordType.API,
        data: apiEntry,
      };

      const result = await upsertApiRecord(uid, record, activeWorkspaceId);

      if (result.success) {
        onSaveRecord(result.data);
        redirectToRequest(navigate, result.data.id);
      }

      setIsLoading(false);

      return result.data;
    },
    [uid, user?.loggedIn, activeWorkspaceId, onSaveRecord, navigate]
  );

  const handleImportRequest = useCallback(
    async (request: RQAPI.Request) => {
      const apiEntry = getEmptyAPIEntry(request);

      return saveRequest(apiEntry)
        .then((apiRecord: RQAPI.ApiRecord) => {
          setSelectedEntryDetails(apiRecord);
        })
        .finally(() => {
          setIsImportModalOpen(false);
        });
    },
    [saveRequest, setIsImportModalOpen]
  );

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
        <ImportRequestModal
          isRequestLoading={isLoading}
          isOpen={isImportModalOpen}
          handleImportRequest={handleImportRequest}
          onClose={onImportRequestModalClose}
        />
      </div>
    </BottomSheetProvider>
  );
};
