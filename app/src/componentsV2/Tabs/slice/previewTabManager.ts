import { reduxStore } from "store";
import { tabsActions } from "./slice";
import { selectPreviewTab } from "./selectors";

export const BUFFER_UPDATED_EVENT = "tabs:bufferUpdated";

export interface BufferUpdatePayload {
  entityId: string;
  entityType: string;
}

export interface BufferUpdateEventDetail extends BufferUpdatePayload {}

export function onBufferUpdated(handler: (payload: BufferUpdatePayload) => void): () => void {
  const eventHandler = (event: Event) => {
    const customEvent = event as CustomEvent<BufferUpdateEventDetail>;
    handler(customEvent.detail);
  };

  window.addEventListener(BUFFER_UPDATED_EVENT, eventHandler);

  return () => {
    window.removeEventListener(BUFFER_UPDATED_EVENT, eventHandler);
  };
}

export function emitBufferUpdate(payload: BufferUpdatePayload): void {
  const event = new CustomEvent<BufferUpdateEventDetail>(BUFFER_UPDATED_EVENT, {
    detail: payload,
  });

  window.dispatchEvent(event);
}

export function setupPreviewTabUnsetListener(): () => void {
  return onBufferUpdated((payload: BufferUpdatePayload) => {
    const state = reduxStore.getState();
    const previewTab = selectPreviewTab(state);

    if (!previewTab) {
      return;
    }

    if (previewTab.modeConfig.mode === "buffer") {
      const { entityId, entityType } = previewTab.modeConfig;
      if (entityId === payload.entityId && entityType === payload.entityType) {
        reduxStore.dispatch(tabsActions.setPreviewTab(undefined));
      }
    }
  });
}

setupPreviewTabUnsetListener();
