import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import { getActiveWorkspaceIds, getAllWorkspaces, getIsWorkspacesFetched } from "store/slices/workspaces/selectors";
import { useAvailableWorkspacesListener } from "./useAvailableWorkspacesListener";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { workspaceManager } from "../helpers/workspaceManager";
import { getAppMode } from "store/selectors";
import { LOGGED_OUT_WORKSPACE_ID } from "../utils";
import { workspaceActions } from "store/slices/workspaces/slice";
import { globalActions } from "store/slices/global/slice";

export const useWorkspaceManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const userId = user.details?.profile?.uid;
  const _userId = useRef(userId);
  const workspaces = useSelector(getAllWorkspaces);
  const _workspaces = useRef(workspaces);
  const appMode = useSelector(getAppMode);

  const isWorkspacesFetched = useSelector(getIsWorkspacesFetched);

  const isFirstInitDone = useRef(false);
  // const [isFirstInitDone, setIsFirstInitDone] = useState(false);

  // This is only a cache. Only used for first init.
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);

  useAvailableWorkspacesListener();

  useEffect(() => {
    console.log("[useWorkspaceManager] workspaceManager updater", { workspaces, userId, appMode });
    _userId.current = userId;
    _workspaces.current = workspaces;
    workspaceManager.init(dispatch, workspaces, userId, appMode);
    console.log("[useWorkspaceManager] workspaceManager updater userid set", { userId });
  }, [dispatch, workspaces, userId, appMode]);

  // Updates workspaceManager with latest data about workspace
  const fetchUnattemptedWorkspaceId = useCallback(() => {
    if (!_userId.current) {
      return LOGGED_OUT_WORKSPACE_ID;
    } else {
      // return a previously non attempted workspace
      // If everything finished, then show a modal
      return _workspaces.current?.[0]?.id;
    }
  }, []);

  const initialWorkspacesSelector = useCallback(() => {
    dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: false }));
    console.log("[useWorkspaceManager].initialWorkspacesSelector", { isFirstInitDone: isFirstInitDone.current });
    if (!isFirstInitDone.current) {
      // Cached Workspaces
      if (activeWorkspaceIds.length > 0) {
        console.log("[useWorkspaceManager].initialWorkspacesSelector cached ActiveWorkspaces", {
          isFirstInitDone: isFirstInitDone.current,
          activeWorkspaceIds,
        });
        isFirstInitDone.current = true;
        workspaceManager.initActiveWorkspaces(activeWorkspaceIds);
      } else {
        console.log("[useWorkspaceManager].initialWorkspacesSelector No cached ActiveWorkspaces", {
          isFirstInitDone: isFirstInitDone.current,
          isWorkspacesFetched,
        });
        if (isWorkspacesFetched) {
          // What happens if this returns undefined?
          const newActiveWorkspaceid = fetchUnattemptedWorkspaceId();
          const newActiveWorkspaceIds = [];
          if (newActiveWorkspaceid) {
            newActiveWorkspaceIds.push(newActiveWorkspaceid);
          }

          // Incase [] is returned, it will be handled else by showing a modal.
          isFirstInitDone.current = true;
          workspaceManager.initActiveWorkspaces(newActiveWorkspaceIds);
        }
      }
    } else {
      if (activeWorkspaceIds.length === 0) {
        console.log("[useWorkspaceManager].initialWorkspacesSelector . Cant select Workspace automatically", {
          isFirstInitDone,
        });

        dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true }));
      }
    }
  }, [activeWorkspaceIds, dispatch, fetchUnattemptedWorkspaceId, isWorkspacesFetched]);

  useEffect(initialWorkspacesSelector, [initialWorkspacesSelector]);

  useEffect(() => {
    return () => {
      console.log("[useWorkspaceManager] userId changed. unmount. resetActiveWorkspaces");
      dispatch(workspaceActions.resetState());
      workspaceManager.resetActiveWorkspaces();
      isFirstInitDone.current = false;
    };
  }, [dispatch, userId]);

  return {};
};
