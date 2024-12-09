import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RuleStorageModel, syncEngine } from "requestly-sync-engine";
import { getAppMode } from "store/selectors";
import { LocalStorageService } from "services/localStorageService";

export const useSyncEngineHelpers = () => {
  const appMode = useSelector(getAppMode);

  const initSyncEngine = useCallback(
    (workspaceId: string, userId?: string) => {
      syncEngine.init([workspaceId], userId);

      RuleStorageModel.registerOnUpdateHook((models: RuleStorageModel[]) => {
        console.log("onUpdateHook Custom");
        LocalStorageService(appMode).saveMultipleRulesOrGroups(models.map((model) => model.data));
      });

      return () => {
        console.log("[useWorkspaceManager] SyncEngine Disconnect Workspace", { workspaceId });
        syncEngine.disconnectWorkspace(workspaceId);
      };
    },
    [appMode]
  );
  return { initSyncEngine };
};
