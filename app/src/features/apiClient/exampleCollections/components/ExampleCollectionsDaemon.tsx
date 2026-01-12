import type { EnvironmentData } from "backend/environment/types";
import { getOwnerId, LOGGED_OUT_STATE_UID } from "backend/utils";
import exampleEnvironments from "features/apiClient/exampleCollections/examples/environments.json";
import { useApiClientRepository } from "features/apiClient/slices";
import {
  importExampleCollections,
  selectIsNudgePermanentlyClosed,
  ImportDependencies,
} from "features/apiClient/slices/exampleCollections";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { WorkspaceType } from "features/workspaces/types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { AppDispatch } from "store/types";

export const ExampleCollectionsDaemon: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const syncRepository = useApiClientRepository();
  const apiClientDispatch = useApiClientDispatch();
  const isNudgePermanentlyClosed = useSelector(selectIsNudgePermanentlyClosed);

  const uid = user?.details?.profile?.uid ?? getOwnerId(user?.details?.profile?.uid);

  useEffect(() => {
    if (uid !== LOGGED_OUT_STATE_UID) {
      return;
    }

    if (activeWorkspace?.workspaceType !== WorkspaceType.PERSONAL) {
      return;
    }

    if (!syncRepository) {
      return;
    }

    if (isNudgePermanentlyClosed) {
      return;
    }

    const environmentsToCreate: EnvironmentData[] = exampleEnvironments.environments.map((env) => ({
      ...env,
      isExample: true,
    }));

    // Dispatch import
    const dependencies: ImportDependencies = {
      repository: syncRepository,
      ownerId: uid,
      environmentsToCreate,
      apiClientDispatch,
    };

    dispatch(importExampleCollections(dependencies));
  }, [uid, activeWorkspace?.workspaceType, isNudgePermanentlyClosed, syncRepository, dispatch, apiClientDispatch]);

  return null;
};
