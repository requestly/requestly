import { createListenerMiddleware } from "@reduxjs/toolkit";
import { entitySynced } from "../common/actions";
import { bufferActions } from "./slice";

export const bufferListenerMiddleware = createListenerMiddleware();

bufferListenerMiddleware.startListening({
  actionCreator: entitySynced,
  effect: (action, listenerApi) => {
    const { entityId, data } = action.payload;

    listenerApi.dispatch(
      bufferActions.syncFromSource({
        referenceId: entityId,
        sourceData: data,
      })
    );
  },
});

export const bufferSyncMiddleware = bufferListenerMiddleware.middleware;
