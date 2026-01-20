import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { closeCorruptedTabs } from "../tabs";

export function markWorkspaceLoaded() {
  closeCorruptedTabs();
  apiClientMultiWorkspaceViewStore.getState().setIsLoaded(true);
}
