import { TabModeConfig } from "componentsV2/Tabs/slice";
import { Workspace } from "features/workspaces/types";
import { useApiClientStore } from "../workspaceView/helpers/ApiClientContextRegistry";
import { NativeError } from "errors/NativeError";
import { useCallback, useSyncExternalStore } from "react";
import { BUFFER_SLICE_NAME } from "../common/constants";
import { findBufferByReferenceId } from "./slice";

export function useIsDirtyBuffer(workspaceId: Workspace["id"], modeConfig: TabModeConfig): boolean {
  const store = useApiClientStore(workspaceId);

  if (modeConfig.mode !== "buffer") {
    throw new NativeError("useIsDirtyBuffer can only be used in buffer mode").addContext({
      mode: modeConfig.mode,
    });
  }

  const getSnapshot = useCallback(() => {
    const bufferState = store.getState()[BUFFER_SLICE_NAME];
    const bufferEntry = findBufferByReferenceId(bufferState.entities, modeConfig.entityId);

    if (!bufferEntry) {
      throw new NativeError("Buffer entry not found!").addContext({ modeConfig });
    }

    return bufferEntry.isDirty;
  }, [modeConfig, store]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}
