import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { getTabServiceActions } from "componentsV2/Tabs/tabUtils";
import { WorkspaceType } from "features/workspaces/types";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "features/apiClient/types";
import { useGetApiClientSyncRepo } from "../../useApiClientSyncRepo";
import { useSyncService } from "../store/hooks";

export const AutoSyncLocalStoreDaemon: React.FC<{ records: RQAPI.Record[] }> = ({ records }) => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid;
  const syncRepository = useGetApiClientSyncRepo();
  const [syncAll, resetSyncStatus] = useSyncService((state) => [state.syncAll, state.resetSyncStatus]);
  const [addNewRecords] = useAPIRecords((state) => [state.addNewRecords]);
  const [syncedLocalApiRecords, setSyncedLocalApiRecords] = useState<RQAPI.Record[]>([]);

  useEffect(() => {
    if (!uid) {
      resetSyncStatus();
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    getTabServiceActions().resetTabs();
    syncAll(syncRepository).then((result) => {
      if (result.success) {
        setSyncedLocalApiRecords(result.data.records);
      }
    });
  }, [uid, activeWorkspace?.workspaceType, syncRepository, syncAll, resetSyncStatus]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    if (records.length === 0 || syncedLocalApiRecords.length === 0) {
      return;
    }

    const shownRecordIds = records.map((record) => record.id);
    const recordsToShow = syncedLocalApiRecords.filter((record) => !shownRecordIds.includes(record.id));

    addNewRecords(recordsToShow);
    setSyncedLocalApiRecords([]);
    return;
  }, [uid, records, syncedLocalApiRecords, activeWorkspace?.workspaceType, addNewRecords]);

  return <></>;
};
