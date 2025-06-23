import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Sentry from "@sentry/react";
import { useGetApiClientSyncRepo } from "../helpers/modules/sync/useApiClientSyncRepo";
import { ApiClientLocalStorage } from "../helpers/modules/sync/localStore/helpers/ApiClientLocalStorage";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";

enum RecordsSyncState {
  IDLE = "idle",
  SYNCING = "syncing",
  SUCCESS = "success",
  ERROR = "error",
}

export const useRecordsSyncService = () => {
  const [syncState, setSyncState] = useState<RecordsSyncState>(RecordsSyncState.IDLE); // make it status

  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useGetApiClientSyncRepo();

  useEffect(() => {
    if (!uid) {
      return;
    }

    if (activeWorkspace?.id) {
      // Only sync in private workspaces
      return;
    }

    const apiClientLocalStorageInstance = ApiClientLocalStorage.getInstance();
    if (!apiClientLocalStorageInstance) {
      // User was never logged out, so no instance exists
      return;
    }

    setSyncState(RecordsSyncState.SYNCING);

    // Get records from local storage
    const records = apiClientLocalStorageInstance.getRecords();

    // TODO: First save environments with all the variables
    syncRepository.apiClientRecordsRepository
      .batchCreateRecordsWithExistingId(records.apis)
      .then((result) => {
        if (result.success) {
          setSyncState(RecordsSyncState.SUCCESS);
          apiClientLocalStorageInstance.resetRecords();
        }
      })
      .catch((error) => {
        Sentry.captureException(error);
        setSyncState(RecordsSyncState.ERROR);
      });
  }, [uid, activeWorkspace?.id, syncRepository]);

  return {
    syncState,
  };
};
