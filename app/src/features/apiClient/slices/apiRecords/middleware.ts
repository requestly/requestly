import { createListenerMiddleware, AnyAction } from "@reduxjs/toolkit";
import { deleteRecords } from "./thunks";
import { deleteEnvironment } from "../environments/thunks";
import { reduxStore } from "store";
import { closeTabByEntityId } from "componentsV2/Tabs/slice/thunks";
import { getAllRecords } from "../../commands/utils";
import {
  AnyListenerPredicate,
  ListenerEffect,
  ListenerErrorHandler,
} from "@reduxjs/toolkit/dist/listenerMiddleware/types";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry";
import { ThunkDispatch } from "redux-thunk";
import * as Sentry from "@sentry/react";

async function closeTabsForRecordIds(
  recordIds: string[],
  skipUnsavedPrompt: boolean = false
): Promise<{ success: boolean; cancelledRecordId?: string }> {
  if (recordIds.length === 0) {
    return { success: true };
  }

  for (const recordId of recordIds) {
    try {
      await reduxStore.dispatch(closeTabByEntityId({ entityId: recordId, skipUnsavedPrompt })).unwrap();
    } catch (error) {
      return { success: false, cancelledRecordId: recordId };
    }
  }

  return { success: true };
}

type ApiClientStoreCloseTabsListener = {
  predicate: AnyListenerPredicate<ApiClientStoreState>;
  effect: ListenerEffect<AnyAction, ApiClientStoreState, ThunkDispatch<ApiClientStoreState, unknown, AnyAction>>;
};

const listeners: ApiClientStoreCloseTabsListener[] = [
  {
    predicate: (action) => action.type === deleteRecords.pending.type,
    effect: async (action, listenerApi) => {
      const { records } = action.meta.arg;
      const recordsToBeDeleted = getAllRecords(records);
      const recordIds = recordsToBeDeleted.map((r) => r.id);

      // Wait for tab closing to complete
      const result = await listenerApi.pause(closeTabsForRecordIds(recordIds, false));

      // If user cancelled tab close, reject the deletion action
      if (!result.success) {
        const rejectionReason = `User cancelled tab close for record ${result.cancelledRecordId}`;

        listenerApi.dispatch(
          deleteRecords.rejected(
            new Error(`Deletion cancelled: ${rejectionReason}`),
            deleteRecords.pending.type,
            action.meta.arg,
            rejectionReason
          )
        );

        return;
      }
    },
  },
  {
    predicate: (action) => action.type === deleteEnvironment.pending.type,
    effect: async (action, listenerApi) => {
      const { environmentId } = action.meta.arg;

      // Wait for tab closing to complete
      const result = await listenerApi.pause(closeTabsForRecordIds([environmentId], false));

      // If user cancelled tab close, reject the deletion action
      if (!result.success) {
        listenerApi.dispatch(
          deleteEnvironment.rejected(
            new Error(`Deletion cancelled: User cancelled tab close for environment ${environmentId}`),
            deleteEnvironment.pending.type,
            action.meta.arg,
            "User cancelled tab close"
          )
        );
        throw new Error(`Deletion cancelled: User cancelled tab close for environment ${environmentId}`);
      }
    },
  },
];

const onError: ListenerErrorHandler = (error, errorInfo) => {
  Sentry.captureException(error, {
    tags: {
      middleware: "apiClientStoreCloseTabsMiddleware",
      raisedBy: errorInfo.raisedBy,
    },
  });
};

const closeTabsMiddleware = createListenerMiddleware({ onError });

listeners.forEach(({ predicate, effect }) => {
  closeTabsMiddleware.startListening({ predicate, effect });
});

export const apiClientStoreCloseTabsMiddleware = closeTabsMiddleware.middleware;
