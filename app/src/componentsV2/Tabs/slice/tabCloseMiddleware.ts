import { createListenerMiddleware, AnyAction } from "@reduxjs/toolkit";
import { workspaceActions } from "store/slices/workspaces/slice";
import { closeAllTabs } from "./thunks";
import { RootState } from "store/types";
import { ReducerKeys } from "store/constants";
import { isEqual } from "lodash";
import { AnyListenerPredicate, ListenerEffect } from "@reduxjs/toolkit/dist/listenerMiddleware/types";
import { ThunkDispatch } from "redux-thunk";

function hasWorkspaceIdsChanged(currentState: unknown, previousState: unknown): boolean {
  const current = currentState as RootState;
  const previous = previousState as RootState;

  const currentWorkspaceIds = current.workspace.activeWorkspaceIds;
  const previousWorkspaceIds = previous.workspace.activeWorkspaceIds;

  return !isEqual(currentWorkspaceIds, previousWorkspaceIds);
}

function hasAuthStateChanged(currentState: unknown, previousState: unknown): boolean {
  const current = currentState as RootState;
  const previous = previousState as RootState;

  const currentLoggedIn = current[ReducerKeys.GLOBAL].user.loggedIn;
  const previousLoggedIn = previous[ReducerKeys.GLOBAL].user.loggedIn;

  return currentLoggedIn !== previousLoggedIn;
}

type TabCloseListener = {
  predicate: AnyListenerPredicate<RootState>;
  effect: ListenerEffect<AnyAction, RootState, ThunkDispatch<RootState, unknown, AnyAction>>;
};

const tabCloseListeners: TabCloseListener[] = [
  {
    predicate: (action, currentState, previousState) => {
      if (action.type !== workspaceActions.setActiveWorkspaceIds.type) {
        return false;
      }
      return hasWorkspaceIdsChanged(currentState, previousState);
    },
    effect: async (action, listenerApi) => {
      await listenerApi.dispatch(closeAllTabs({ skipUnsavedPrompt: true })).unwrap();
    },
  },
  {
    predicate: (action, currentState, previousState) => {
      if (action.type !== `${ReducerKeys.GLOBAL}/updateUserInfo`) {
        return false;
      }
      return hasAuthStateChanged(currentState, previousState);
    },
    effect: async (action, listenerApi) => {
      await listenerApi.dispatch(closeAllTabs({ skipUnsavedPrompt: true })).unwrap();
    },
  },
];

const tabCloseListenerMiddleware = createListenerMiddleware();

tabCloseListeners.forEach(({ predicate, effect }) => {
  tabCloseListenerMiddleware.startListening({ predicate, effect });
});

export const tabCloseMiddleware = tabCloseListenerMiddleware.middleware;
