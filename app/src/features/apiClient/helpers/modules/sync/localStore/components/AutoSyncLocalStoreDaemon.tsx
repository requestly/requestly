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

const LoggedInDaemon: React.FC<{}> = () => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const syncRepository = useApiClientRepository();
  const [syncAll, setSyncTask] = useSyncService((state) => [state.syncAll, state.setSyncTask]);
  const [addNewRecords, getAllRecords] = useAPIRecords((state) => [
    state.addNewRecords,
    state.getAllRecords,
    state.refresh,
  ]);

  useEffect(() => {
    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    const existingTask = syncServiceStore.getState().syncTask;

    if (existingTask) {
      return;
    }

    const task = (async () => {
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

    setSyncTask(task);
  }, [activeWorkspace?.workspaceType, syncRepository, syncAll, getAllRecords, addNewRecords, setSyncTask]);

  return <></>;
};

const LoggedOutDaemon: React.FC<{}> = () => {
  const [syncTask] = useSyncService((state) => [state.syncTask]);
  const [getAllRecords, refresh] = useAPIRecords((state) => [state.getAllRecords, state.refresh]);

  useEffect(() => {
    if (!syncTask) {
      return;
    }

    (async () => {
      try {
        await syncTask;
        const records = getAllRecords();

        // If there is no data, then there' no need to reset anything
        if (!records.length) {
          return;
        }

        // But if there are records, we reset them since syncing has been successful
        refresh([]);
      } catch (e) {
        // This is a noop, since syncing failing in logged out state
        // doesn't warrant any action.
      }
    })();
  }, [syncTask, getAllRecords, refresh]);

  return <></>;
};

export const AutoSyncLocalStoreDaemon: React.FC<{}> = () => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  if (!uid) {
    return <LoggedOutDaemon />;
  }
  return <LoggedInDaemon />;
};
