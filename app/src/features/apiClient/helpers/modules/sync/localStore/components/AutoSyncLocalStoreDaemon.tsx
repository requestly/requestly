import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useApiClientRepository } from "../../useApiClientSyncRepo";
import { useSyncService } from "../store/hooks";
import { toast } from "utils/Toast";
import {
  trackLocalStorageSyncCompleted,
  trackLocalStorageSyncFailed,
} from "modules/analytics/events/features/apiClient";
import * as Sentry from "@sentry/react";
import { syncServiceStore } from "../store/syncServiceStore";
import { APIClientSyncService } from "../store/types";

export const AutoSyncLocalStoreDaemon: React.FC<{}> = () => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useApiClientRepository();
  const [syncAll] = useSyncService((state) => [state.syncAll]);
  const [addNewRecords, getAllRecords, refresh] = useAPIRecords((state) => [
    state.addNewRecords,
    state.getAllRecords,
    state.refresh,
  ]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (!uid) {
      unsubscribe = syncServiceStore.subscribe(
        (state) => state.apisSyncStatus,
        (apisSyncStatus) => {
          if (apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
            refresh([]);
            unsubscribe();
          }
        }
      );
      return;
    }

    // Unsubscribe from the previous subscription if any from logged out state
    unsubscribe();

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    (async () => {
      try {
        const syncedEnvironmentIds: string[] = [];
        const environments = await syncRepository.environmentVariablesRepository.getAllEnvironments();
        if (environments.success) {
          const envs = Object.values(environments.data.environments ?? {});
          const envIds = envs.map((e) => e.id);
          syncedEnvironmentIds.push(...envIds);
        }

        const syncedRecordIds: string[] = getAllRecords().map((r) => r.id);
        const recordsToSkip = new Set(syncedRecordIds);
        const environmentsToSkip = new Set(syncedEnvironmentIds);

        const syncedRecords = await syncAll(syncRepository, {
          recordsToSkip,
          environmentsToSkip,
        });

        if (syncedRecords.records.length) {
          addNewRecords(syncedRecords.records);
        }

        if (syncedRecords.records.length || syncedRecords.environments.length) {
          trackLocalStorageSyncCompleted({ type: "api" });
          toast.success("Your local APIs are ready");
        }
      } catch (error) {
        trackLocalStorageSyncFailed({ type: "api" });
        Sentry.captureException(error);
        toast.error("Something went wrong while loading your local APIs");
      }
    })();
  }, [uid, activeWorkspace?.workspaceType, syncRepository, syncAll, getAllRecords, addNewRecords, refresh]);

  return <></>;
};
