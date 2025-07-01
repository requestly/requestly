import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { WorkspaceType } from "features/workspaces/types";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useApiClientRepository } from "../../useApiClientSyncRepo";
import { useSyncService } from "../store/hooks";

export const AutoSyncLocalStoreDaemon: React.FC<{}> = () => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useApiClientRepository();
  const [syncAll] = useSyncService((state) => [state.syncAll]);
  const [addNewRecords, getAllRecords] = useAPIRecords((state) => [state.addNewRecords, state.getAllRecords]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    getTabServiceActions().resetTabs();

    (async () => {
      const syncedRecordIds: string[] = [...getAllRecords().map((r) => r.id)];
      const syncedEnvironmentIds: string[] = [...getAllRecords().map((r) => r.id)];
      const environments = await syncRepository.environmentVariablesRepository.getAllEnvironments();
      if (environments.success) {
        const envs = Object.values(environments.data.environments ?? {});
        const envIds = envs.map((e) => e.id);
        syncedEnvironmentIds.push(...envIds);
      }
      const recordsToSkip = new Set(syncedRecordIds);
      const environmentsToSkip = new Set(syncedEnvironmentIds);
      const syncedRecords = await syncAll(syncRepository, {
        recordsToSkip,
        environmentsToSkip,
      });

      if (syncedRecords.records.length) {
        addNewRecords(syncedRecords.records);
      }
    })();
  }, [uid, activeWorkspace?.workspaceType, syncRepository, syncAll, getAllRecords, addNewRecords]);

  return <></>;
};
