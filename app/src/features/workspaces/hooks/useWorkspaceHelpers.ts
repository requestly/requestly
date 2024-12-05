import { workspaceManager } from "../helpers/workspaceManager";

export const useWorkspaceHelpers = () => {
  const switchWorkspace = (workspaceId: string) => {
    // // TODO-Syncing: 1. Offload things that needs to be saved
    // // 2. Clear
    // StorageService(appMode).clearDB();

    workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace };
};
