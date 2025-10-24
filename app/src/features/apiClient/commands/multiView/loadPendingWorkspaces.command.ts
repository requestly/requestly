import {
  apiClientMultiWorkspaceViewStore,
  RenderableWorkspaceState,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { setupContextWithoutMarkingLoaded } from "../context";
import { markWorkspaceLoaded } from "./markWorkspaceLoaded.command";
import * as Sentry from "@sentry/react";
import { NativeError } from "errors/NativeError";
import { StoreApi } from "zustand";
import { Try } from "utils/try";

async function _loadWorkspace(params: {
  userId: string | undefined;
  workspaceState: StoreApi<RenderableWorkspaceState>;
}) {
  const { userId, workspaceState } = params;

  const workspace = workspaceState.getState();
  apiClientMultiWorkspaceViewStore
    .getState()
    .setStateForSelectedWorkspace(workspace.id, { loading: true, errored: false });

  const result = await Try(async () => {
    await setupContextWithoutMarkingLoaded(workspace.rawWorkspace, {
      loggedIn: !!userId,
      uid: userId ?? "",
    });
  });

  result
    .inspect(() => {
      apiClientMultiWorkspaceViewStore
        .getState()
        .setStateForSelectedWorkspace(workspace.id, { loading: false, errored: false });
    })
    .mapError((error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred while adding workspace to view";

      apiClientMultiWorkspaceViewStore.getState().setStateForSelectedWorkspace(workspace.id, {
        loading: false,
        errored: true,
        error: errorMessage,
      });

      return new NativeError(errorMessage).addContext({ workspaceId: workspace.id });
    });

  return result;
}

export async function loadWorkspaces(userId?: string) {
  apiClientMultiWorkspaceViewStore.getState().setIsLoaded(false);

  const workspacesToLoad = apiClientMultiWorkspaceViewStore
    .getState()
    .selectedWorkspaces.filter((w) => !w.getState().state.loading);

  const tasks = workspacesToLoad.map((workspaceState) => {
    return _loadWorkspace({ userId, workspaceState });
  });

  const results = await Promise.allSettled(tasks);

  const failedTasks = results.filter((task) => {
    if (task.status === "rejected") {
      return true;
    }

    return task.status === "fulfilled" && task.value.isError();
  });

  if (failedTasks.length > 0) {
    const errors = failedTasks.map((task) => {
      return {
        error: task.status === "rejected" ? task.reason : task.value.unwrapError().message,
      };
    });

    const error = new NativeError("Some workspaces failed to load in multi-view").addContext({ errors });
    Sentry.captureException(error);
  }

  markWorkspaceLoaded();
}
