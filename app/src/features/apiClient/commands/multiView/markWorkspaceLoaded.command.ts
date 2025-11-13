import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { closeCorruptedTabs } from "../tabs";

export function markWorkspaceLoaded() {
  closeCorruptedTabs();
  /**
   * - Close all the tabs for which context was not found and continue the flow
   *    - Cons:
   *        - In worst case, all the tabs will be closed, which affects UX
   * - Close the tabs and if error then return without marking
   *    - Cons:
   *       - UI stuck on loading state
   *       - No way to recover
   * - Close tabs by failed workspaces
   */
  apiClientMultiWorkspaceViewStore.getState().setIsLoaded(true);
}
