import { captureException } from "@sentry/react";
import APP_CONSTANTS from "config/constants";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { Workspace, WorkspaceMemberRole } from "features/workspaces/types";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllWorkspaces } from "services/fsManagerServiceAdapter";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { WorkspaceType } from "types";
import { submitAttrUtil } from "utils/AnalyticsUtils";

export const useFetchLocalWorkspaces = () => {
  const user = useSelector(getUserAuthDetails);
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const [localWorkspaces, setLocalWorkspaces] = useState<Workspace[]>([]);

  const fetchLocalWorkspaces = useCallback(async () => {
    if (!isLocalSyncEnabled) {
      setLocalWorkspaces([]);
      return;
    }

    const uid = user.details?.profile?.uid;
    // TODO: uid is needed as per current implementation, to be removed when logged out support is implemented
    if (!user.loggedIn || !uid) {
      setLocalWorkspaces([]); // TODO: to be removed when local first support is added
      return;
    }

    try {
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
      setLocalWorkspaces(localRecords);
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_LOCAL_WORKSPACES, localRecords.length);
    } catch (e) {
      captureException(e);
      setLocalWorkspaces([]);
    }
  }, [isLocalSyncEnabled, user?.details?.profile?.uid, user.loggedIn]);

  useEffect(() => {
    fetchLocalWorkspaces();
  }, [fetchLocalWorkspaces]);

  return { localWorkspaces };
};
