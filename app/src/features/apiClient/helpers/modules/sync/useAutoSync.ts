import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useGetApiClientSyncRepo } from "./useApiClientSyncRepo";
import { useIsAllSynced, useSyncServiceStore } from "./localStore/store/hooks";

export const useAutoSync = () => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useGetApiClientSyncRepo();
  const isSynced = useIsAllSynced();
  const [syncAll, resetSyncStatus] = useSyncServiceStore((state) => [state.syncAll, state.resetSyncStatus]);

  useEffect(() => {
    if (!uid) {
      resetSyncStatus();
      return;
    }

    if (activeWorkspace?.id || isSynced) {
      return;
    }

    syncAll(syncRepository);
  }, [uid, activeWorkspace?.id, syncRepository, isSynced, syncAll, resetSyncStatus]);
};
