import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RuleStorageModel, syncEngine } from "requestly-sync-engine";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getAppMode, getIsSyncingV2 } from "store/selectors";
import { LocalStorageService } from "services/localStorageService";

export const useSyncEngine = () => {
  const [isSyncEngineInitialized, setIsSyncEngineInitialized] = useState(false);

  const appMode = useSelector(getAppMode);
  const userAuthDetails = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const userId = userAuthDetails.details?.profile?.uid;
  const isSyncingV2 = useSelector(getIsSyncingV2);

  useEffect(() => {
    const workspaceId = activeWorkspace?.id ? `workspace-${activeWorkspace?.id}` : userId || `local`;

    async function initSyncEngine() {
      await syncEngine.init([workspaceId], userId);
      setIsSyncEngineInitialized(true);

      RuleStorageModel.registerOnUpdateHook((models: RuleStorageModel[]) => {
        console.log("onUpdateHook Custom");
        LocalStorageService(appMode).saveMultipleRulesOrGroups(models.map((model) => model.data));
      });
    }

    initSyncEngine();

    return () => {
      console.log("!!!debug Disconnect Workspace", { workspaceId });
      setIsSyncEngineInitialized(false);
      syncEngine.disconnectWorkspace(workspaceId);
    };
  }, [userId, activeWorkspace?.id, appMode, isSyncingV2]);
};
