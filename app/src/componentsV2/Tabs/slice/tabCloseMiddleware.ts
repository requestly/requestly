import { createListenerMiddleware } from "@reduxjs/toolkit";
import { workspaceActions } from "store/slices/workspaces/slice";
import { closeAllTabs } from "./thunks";
import { RootState } from "store/types";
import { ReducerKeys } from "store/constants";
import { isEqual } from "lodash";

const tabCloseListenerMiddleware = createListenerMiddleware();

function hasWorkspaceIdsChanged(currentState: unknown, previousState: unknown): boolean {
  const current = currentState as RootState;
  const previous = previousState as RootState;

  const currentWorkspaceIds = current.workspace.activeWorkspaceIds;
  const previousWorkspaceIds = previous.workspace.activeWorkspaceIds;

  return isEqual(currentWorkspaceIds, previousWorkspaceIds);
}

tabCloseListenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    if (action.type !== workspaceActions.setActiveWorkspaceIds.type) {
      return false;
    }

    return hasWorkspaceIdsChanged(currentState, previousState);
  },
  effect: async (action, listenerApi) => {
    await listenerApi.dispatch(closeAllTabs({ skipUnsavedPrompt: true })).unwrap();
  },
});

function hasAuthStateChanged(currentState: unknown, previousState: unknown): boolean {
  const current = currentState as RootState;
  const previous = previousState as RootState;

  const currentLoggedIn = current[ReducerKeys.GLOBAL].user.loggedIn;
  const previousLoggedIn = previous[ReducerKeys.GLOBAL].user.loggedIn;

  return currentLoggedIn !== previousLoggedIn;
}

tabCloseListenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    if (action.type !== `${ReducerKeys.GLOBAL}/updateUserInfo`) {
      return false;
    }

    return hasAuthStateChanged(currentState, previousState);
  },
  effect: async (action, listenerApi) => {
    await listenerApi.dispatch(closeAllTabs({ skipUnsavedPrompt: true })).unwrap();
  },
});

export const tabCloseMiddleware = tabCloseListenerMiddleware.middleware;
