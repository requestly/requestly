import React, { useEffect } from "react";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useExampleCollections } from "../store";
import { WorkspaceType } from "features/workspaces/types";
import { getOwnerId, LOGGED_OUT_STATE_UID } from "backend/utils";
import { useCommand } from "features/apiClient/commands";
import { useAPIRecordsStore } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";

export const ExampleCollectionsDaemon: React.FC = () => {
  const store = useAPIRecordsStore();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const uid = user?.details?.profile?.uid ?? getOwnerId(user?.details?.profile?.uid);
  const syncRepository = useApiClientRepository();
  const [importExampleCollections] = useExampleCollections((s) => [s.importExampleCollections]);
  const {
    env: { createEnvironments },
  } = useCommand();

  const dispatch = useDispatch();

  useEffect(() => {
    if (uid !== LOGGED_OUT_STATE_UID) {
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    const envsStore = { createEnvironments };
    importExampleCollections({
      ownerId: uid,
      respository: syncRepository,
      recordsStore: store,
      envsStore,
      dispatch,
    });
  }, [
    uid,
    activeWorkspace?.workspaceType,
    syncRepository,
    importExampleCollections,
    store,
    createEnvironments,
    dispatch,
  ]);

  return <></>;
};
