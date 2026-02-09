import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { useSyncService } from "../store/hooks";
import { toast } from "utils/Toast";
import {
  trackLocalStorageSyncCompleted,
  trackLocalStorageSyncFailed,
} from "modules/analytics/events/features/apiClient";
import * as Sentry from "@sentry/react";
import { syncServiceStore } from "../store/syncServiceStore";
import { APIClientSyncService } from "../store/types";
import { ApiClientLocalStoreRepository } from "../ApiClientLocalStorageRepository";
import { apiRecordsActions, useApiClientRepository, useApiClientStore } from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";

const LoggedInDaemon: React.FC<{}> = () => {
  const activeWorkspace = useSelector(getActiveWorkspace);
  const syncRepository = useApiClientRepository();
  const [syncAll, setSyncTask] = useSyncService((state) => [state.syncAll, state.setSyncTask]);
  const store = useApiClientStore();
  const dispatch = useApiClientDispatch();

  useEffect(() => {
    if (syncRepository instanceof ApiClientLocalStoreRepository) {
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    const existingTask = syncServiceStore.getState().syncTask;

    if (existingTask) {
      return;
    }

    const task: APIClientSyncService.SyncTask = (async () => {
      try {
        const syncedEnvironmentIds: string[] = [];
        const environments = await syncRepository.environmentVariablesRepository.getAllEnvironments();
        if (environments.success) {
          const envs = Object.values(environments.data.environments ?? {});
          const envIds = envs.map((e) => e.id);
          syncedEnvironmentIds.push(...envIds);
        }

        const syncedRecordIds: string[] = store.getState().records.records.ids as string[];
        const recordsToSkip = new Set(syncedRecordIds);
        const environmentsToSkip = new Set(syncedEnvironmentIds);

        const syncedRecords = await syncAll(syncRepository, {
          recordsToSkip,
          environmentsToSkip,
        });

        if (syncedRecords.records.length) {
          dispatch(apiRecordsActions.upsertRecords(syncedRecords.records));
        }

        if (syncedRecords.records.length || syncedRecords.environments.length) {
          trackLocalStorageSyncCompleted({ type: "api" });
          toast.success("Your local APIs are ready");
        }

        return { success: true, data: { records: syncedRecords.records, environments: syncedRecords.environments } };
      } catch (error) {
        trackLocalStorageSyncFailed({ type: "api" });
        Sentry.captureException(error);
        toast.error("Something went wrong while loading your local APIs");

        return {
          success: false,
          message: "Syncing failed",
        };
      } finally {
        setSyncTask(null);
      }
    })();

    setSyncTask(task);
  }, [activeWorkspace?.workspaceType, syncRepository, syncAll, store, dispatch, setSyncTask]);

  return <></>;
};

const LoggedOutDaemon: React.FC<{}> = () => {
  const [syncTask, setSyncTask] = useSyncService((state) => [state.syncTask, state.setSyncTask]);
  const store = useApiClientStore();
  const dispatch = useApiClientDispatch();

  useEffect(() => {
    if (!syncTask) {
      return;
    }

    (async () => {
      try {
        const result = await syncTask;
        setSyncTask(null);

        if (!result.success) {
          return;
        }

        const syncedRecords = result.data.records;
        const syncedRecordIds = syncedRecords.map((r) => r.id);

        dispatch(apiRecordsActions.clearRecords(syncedRecordIds))
      } catch (e) {
        // This is a noop, since syncing failing in logged out state
        // doesn't warrant any action.
      }
    })();
  }, [syncTask, setSyncTask, store, dispatch]);

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
