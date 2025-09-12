import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { setupContextWithoutMarkingLoaded } from "../context";
import { markWorkspaceLoaded } from "./markWorkspaceLoaded.command";

export async function loadWorkspaces(userId?: string) {
  const workspacesToLoad = apiClientMultiWorkspaceViewStore
    .getState()
    .selectedWorkspaces.filter((w) => !w.getState().state.loading);

  const tasks = workspacesToLoad.map(async (workspaceState) => {
    const workspace = workspaceState.getState();
    apiClientMultiWorkspaceViewStore
      .getState()
      .setStateForSelectedWorkspace(workspace.id, { loading: true, errored: false });
    try {
      await setupContextWithoutMarkingLoaded(workspace.rawWorkspace, {
        loggedIn: !!userId,
        uid: userId ?? "",
      });

      apiClientMultiWorkspaceViewStore
        .getState()
        .setStateForSelectedWorkspace(workspace.id, { loading: false, errored: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred while adding workspace to view";
      apiClientMultiWorkspaceViewStore.getState().setStateForSelectedWorkspace(workspace.id, {
        loading: false,
        errored: true,
        error: errorMessage,
      });
    }
  });

  const result = await Promise.allSettled(tasks);

  markWorkspaceLoaded();
  return result;
}
