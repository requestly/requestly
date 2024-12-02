import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import { getActiveWorkspaceId, getWorkspaceById } from "store/slices/workspaces/selectors";
import { useAvailableWorkspacesListener } from "./useAvailableTeamsListener";
import { useHasChanged } from "hooks";
import { workspaceActions } from "store/slices/workspaces/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getPrivateWorkspaceId, hasAccessToWorkspace } from "../utils";
import { useSyncEngineHelpers } from "hooks/useSyncEngineHelpers";

export const useWorkspaceManager = () => {
  const dispatch = useDispatch();

  const userId = useSelector(getUserAuthDetails).details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const hasActiveWorkspaceIdChanged = useHasChanged(activeWorkspaceId);

  let activeWorkspace = useSelector(getWorkspaceById(activeWorkspaceId));
  const _activeWorkspaceRef = useRef(activeWorkspace);

  const { initSyncEngine } = useSyncEngineHelpers();

  useAvailableWorkspacesListener();

  useEffect(() => {
    console.log("[useWorkspaceManager]", "Updating activeWorkspaceRef");
    _activeWorkspaceRef.current = activeWorkspace;
  }, [activeWorkspace]);

  const initWorkspace = useCallback(
    (workspaceId: string) => {
      console.log("[useWorkspaceManager]", "Init workspace", { workspaceId });
      window.activeWorkspaceId = workspaceId;

      const disconnectSyncEngine = initSyncEngine(workspaceId, userId);

      // TODO-Syncing: Add other things which needs to be init in the extension db
      // https://github.com/requestly/requestly/blob/fbe5e0fa116d84c454f2d7218646e0acbbb3f6c9/app/src/actions/TeamWorkspaceActions.js#L38

      return () => {
        console.log("[useWorkspaceManager]", "Unsub");
        disconnectSyncEngine?.();
      };
    },
    [initSyncEngine, userId]
  );

  const activeWorkspaceCorrection = useCallback(
    (currentActiveWorkspaceId: string) => {
      let correctedActiveWorkspaceId;
      if (!userId) {
        correctedActiveWorkspaceId = undefined;
      } else {
        if (!activeWorkspaceId) {
          correctedActiveWorkspaceId = getPrivateWorkspaceId(userId);
        } else {
          if (hasAccessToWorkspace(userId, _activeWorkspaceRef.current)) {
            correctedActiveWorkspaceId = currentActiveWorkspaceId;
          } else {
            correctedActiveWorkspaceId = getPrivateWorkspaceId(userId);
          }
        }
      }

      if (currentActiveWorkspaceId !== correctedActiveWorkspaceId) {
        console.log("[useWorkspaceManager] activeWorkspaceCorrection", {
          userId,
          currentActiveWorkspaceId,
          correctedActiveWorkspaceId,
        });
        dispatch(workspaceActions.setActiveWorkspaceId(correctedActiveWorkspaceId));
        return true;
      }
    },
    [activeWorkspaceId, dispatch, userId]
  );

  // Active Workspace Correction
  useEffect(() => {
    console.log("[useWorkspaceManager]", { activeWorkspaceId, activeWorkspace: _activeWorkspaceRef.current });
    const isCorrected = activeWorkspaceCorrection(activeWorkspaceId);

    let unsub: any;
    if (!isCorrected) {
      unsub = initWorkspace(activeWorkspaceId);
    }

    return () => {
      unsub?.();
    };
  }, [activeWorkspaceId, initWorkspace, activeWorkspaceCorrection]);

  return {};
};
