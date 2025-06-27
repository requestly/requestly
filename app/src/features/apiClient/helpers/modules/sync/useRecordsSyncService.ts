import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Sentry from "@sentry/react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useGetApiClientSyncRepo } from "./useApiClientSyncRepo";
import localStoreRepository from "./localStore/ApiClientLocalStorageRepository";

enum RecordsSyncStatus {
  IDLE = "idle",
  ERROR = "error",
  SYNCING = "syncing",
  SUCCESS = "success",
}

export const useRecordsSyncService = () => {
  const [apisSyncStatus, setApisSyncStatus] = useState<RecordsSyncStatus>(RecordsSyncStatus.IDLE);
  const [envsSyncStatus, setEnvsSyncStatus] = useState<RecordsSyncStatus>(RecordsSyncStatus.IDLE);

  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useGetApiClientSyncRepo();

  useEffect(() => {
    if (!uid) {
      return;
    }

    if (activeWorkspace?.id) {
      return;
    }

    setApisSyncStatus(RecordsSyncStatus.SYNCING);
    localStoreRepository.apiClientRecordsRepository
      .getAllRecords()
      .then((result) => {
        return syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(result.data.records);
      })
      .then(() => {
        setApisSyncStatus(RecordsSyncStatus.SUCCESS);
        syncRepository.apiClientRecordsRepository.getRecordsForForceRefresh();
        return localStoreRepository.apiClientRecordsRepository.clear();
      })
      .catch((error) => {
        Sentry.captureException(error);
        setApisSyncStatus(RecordsSyncStatus.ERROR);
      });

    setEnvsSyncStatus(RecordsSyncStatus.SYNCING);
    localStoreRepository.environmentVariablesRepository
      .getAllEnvironments()
      .then((result) => {
        return syncRepository.environmentVariablesRepository.createEnvironments(
          Object.values(result.data.environments)
        );
      })
      .then(() => {
        setEnvsSyncStatus(RecordsSyncStatus.SUCCESS);
        return localStoreRepository.environmentVariablesRepository.clear();
      })
      .catch((error) => {
        Sentry.captureException(error);
        setEnvsSyncStatus(RecordsSyncStatus.ERROR);
      });
  }, [uid, activeWorkspace?.id, syncRepository]);

  return {
    apisSyncStatus,
    envsSyncStatus,
  };
};
