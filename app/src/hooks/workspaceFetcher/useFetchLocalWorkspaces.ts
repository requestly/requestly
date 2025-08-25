import { captureException } from "@sentry/react";
import APP_CONSTANTS from "config/constants";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { WorkspaceMemberRole } from "features/workspaces/types";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAllWorkspaces } from "services/fsManagerServiceAdapter";
import { workspaceActions } from "store/slices/workspaces/slice";
import { WorkspaceType } from "types";
import { submitAttrUtil } from "utils/AnalyticsUtils";

export const useFetchLocalWorkspaces = () => {
  const dispatch = useDispatch();
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const fetchLocalWorkspaces = useCallback(async () => {
    if (!isLocalSyncEnabled) {
      return;
    }

    try {
      const uid = "random_uid";

      const allLocalWorkspacesResult = await getAllWorkspaces();
      const allLocalWorkspaces = allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];

      const localRecords = [];

      for (const partialWorkspace of allLocalWorkspaces) {
        const localWorkspace = {
          id: partialWorkspace.id,
          name: partialWorkspace.name,
          owner: uid,
          accessCount: 1,
          adminCount: 1,
          members: {
            [uid]: {
              role: WorkspaceMemberRole.admin,
            },
          },
          appsumo: false,
          workspaceType: WorkspaceType.LOCAL,
          rootPath: partialWorkspace.path,
        };

        localRecords.push(localWorkspace);
      }
      dispatch(workspaceActions.upsertManyWorkspaces(localRecords));
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_LOCAL_WORKSPACES, localRecords.length);
    } catch (e) {
      captureException(e);
    }
  }, [dispatch, isLocalSyncEnabled]);

  useEffect(() => {
    fetchLocalWorkspaces();
  }, [fetchLocalWorkspaces]);
};
