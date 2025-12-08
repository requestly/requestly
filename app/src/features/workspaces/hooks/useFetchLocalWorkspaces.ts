import APP_CONSTANTS from "config/constants";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { WorkspaceType } from "features/workspaces/types";
import { useCallback } from "react";
import { getAllWorkspaces } from "services/fsManagerServiceAdapter";
import { submitAttrUtil } from "utils/AnalyticsUtils";

export const useFetchLocalWorkspaces = () => {
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const fetchLocalWorkspaces = useCallback(async () => {
    if (!isLocalSyncEnabled) {
      return [];
    }

    const allLocalWorkspacesResult = await getAllWorkspaces();
    const allLocalWorkspaces = allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];

    const localRecords = [];

    for (const partialWorkspace of allLocalWorkspaces) {
      const localWorkspace = {
        id: partialWorkspace.id,
        name: partialWorkspace.name,
        owner: "",
        accessCount: 1,
        adminCount: 1,
        members: {},
        appsumo: false,
        workspaceType: WorkspaceType.LOCAL,
        rootPath: partialWorkspace.path,
      };

      localRecords.push(localWorkspace);
    }
    submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_LOCAL_WORKSPACES, localRecords.length);
    return localRecords;
  }, [isLocalSyncEnabled]);

  return { fetchLocalWorkspaces };
};
