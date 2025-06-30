import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useGetApiClientSyncRepo } from "./useApiClientSyncRepo";
import { useIsAllSynced, useSyncService } from "./localStore/store/hooks";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { WorkspaceType } from "features/workspaces/types";

let i = 0;
export const useAutoSync = () => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useGetApiClientSyncRepo();
  const isSynced = useIsAllSynced();
  const [syncAll, resetSyncStatus] = useSyncService((state) => [state.syncAll, state.resetSyncStatus]);

  useEffect(() => {
    if (!uid) {
      resetSyncStatus();
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    if (isSynced) {
      return;
    }

    console.log("Auto-syncing API Client data...", i++);

    getTabServiceActions().resetTabs();
    syncAll(syncRepository);
  }, [uid, activeWorkspace?.workspaceType, syncRepository, isSynced, syncAll, resetSyncStatus]);
};
