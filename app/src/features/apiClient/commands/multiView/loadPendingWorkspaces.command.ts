import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { setupContextWithoutMarkingLoaded } from "../context";
import { markWorkspaceLoaded } from "./markWorkspaceLoaded.command";

//this is workspace loading part
export async function loadWorkspaces(userId?: string) {
  const workspacesToLoad = apiClientMultiWorkspaceViewStore
    .getState()
    .selectedWorkspaces.filter((w) => !w.getState().state.loading);

  console.log("[LOAD WORKSPACES] Loading", workspacesToLoad.length, "workspaces sequentially");

  // Load workspaces sequentially to avoid background service concurrency issues
  const results = [];
  for (const workspaceState of workspacesToLoad) {
    const workspace = workspaceState.getState();
    console.log("[LOAD WORKSPACES] Starting load for:", workspace.name);
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

      console.log("[LOAD WORKSPACES] Successfully loaded:", workspace.name);
      results.push({ status: "fulfilled", value: workspace.id });
    } catch (error) {
      console.error("[LOAD WORKSPACES] Failed to load:", workspace.name, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred while adding workspace to view";
      apiClientMultiWorkspaceViewStore.getState().setStateForSelectedWorkspace(workspace.id, {
        loading: false,
        errored: true,
        error: errorMessage,
      });
      results.push({ status: "rejected", reason: error });
    }
  }

  markWorkspaceLoaded();
  console.log("[LOAD WORKSPACES] All workspaces processed:", results);
  return results;
}
