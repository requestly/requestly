import React, { useEffect } from "react";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useExampleCollections } from "../store";
import { WorkspaceType } from "features/workspaces/types";
import { StoreApi } from "zustand";
import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { getOwnerId, LOGGED_OUT_STATE_UID } from "backend/utils";

export const ExampleCollectionsDaemon: React.FC<{ store: StoreApi<ApiRecordsState> }> = ({ store }) => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid ?? getOwnerId(user?.details?.profile?.uid);
  const syncRepository = useApiClientRepository();
  const [importExampleCollections] = useExampleCollections((s) => [s.importExampleCollections]);
  const { forceRefreshEnvironments } = useEnvironmentManager();
  const dispatch = useDispatch();

  useEffect(() => {
    if (uid !== LOGGED_OUT_STATE_UID) {
      return;
    }

    if (activeWorkspace.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    const envsStore = { forceRefreshEnvironments };
    importExampleCollections({
      ownerId: uid,
      respository: syncRepository,
      recordsStore: store,
      envsStore,
      dispatch,
    });
  }, [
    uid,
    activeWorkspace.workspaceType,
    syncRepository,
    importExampleCollections,
    store,
    forceRefreshEnvironments,
    dispatch,
  ]);

  return <></>;
};
