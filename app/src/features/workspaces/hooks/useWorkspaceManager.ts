import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import { getActiveWorkspaceIds, getAllWorkspaces, getWorkspacesUpdatedAt } from "store/slices/workspaces/selectors";
import { useWorkspaceFetcher } from "./useWorkspaceFetcher";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { workspaceManager } from "../helpers/workspaceManager";
import { workspaceActions } from "store/slices/workspaces/slice";
import { globalActions } from "store/slices/global/slice";
import { useActiveWorkspacesMembersListener } from "./useActiveWorkspaceMembersListener";

export const useWorkspaceManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const userId = user.details?.profile?.uid;
  const _userId = useRef(userId);
  const workspaces = useSelector(getAllWorkspaces);
  const _workspaces = useRef(workspaces);

  const workspacesUpdatedAt = useSelector(getWorkspacesUpdatedAt);
  const _workspacesUpdatedAt = useRef(workspacesUpdatedAt);

  const isInitialWorkspacesSelected = useRef(false);
  // const [isInitialWorkspacesSelected, setisInitialWorkspacesSelected] = useState(false);

  // This is only a cache. Only used for first init.
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);
  const _activeWorkspaceIds = useRef(activeWorkspaceIds);

  useWorkspaceFetcher();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    console.log("[useWorkspaceManager] workspaceManager updater", { workspaces, userId });
    _userId.current = userId;
    workspaceManager.init(dispatch, workspaces, userId);
    console.log("[useWorkspaceManager] workspaceManager updater userid set", { userId });
  }, [dispatch, workspaces, userId, workspacesUpdatedAt]);

  useEffect(() => {
    console.log("[useWorkspaceManager] workspaceManager updater activeWorkspaceIds", { activeWorkspaceIds });
    _activeWorkspaceIds.current = activeWorkspaceIds;
  }, [activeWorkspaceIds]);

  useEffect(() => {
    console.log("[useWorkspaceManager] workspaceManager updater workspacesUpdatedAt", { workspacesUpdatedAt });
    _workspacesUpdatedAt.current = workspacesUpdatedAt;
    _workspaces.current = workspaces;
  }, [workspaces, workspacesUpdatedAt]);

  // Updates workspaceManager with latest data about workspace
  const fetchUnattemptedWorkspaceId = useCallback(() => {
    console.log("[useWorkspaceManager].fetchUnattemptedWorkspaceId", { userId: _userId.current });
    // if (!_userId.current) {
    //   return LOGGED_OUT_WORKSPACE_ID;
    // } else {
    // return a previously non attempted workspace
    // If everything finished, then show a modal
    return _workspaces.current?.[0]?.id;
    // }
  }, []);

  const initialWorkspacesSelector = useCallback(
    async (run: number) => {
      console.log("[useWorkspaceManager.initialWorkspacesSelector]", {
        isInitialWorkspacesSelected: isInitialWorkspacesSelected.current,
        activeWorkspaceIds: _activeWorkspaceIds.current,
        workspaces: _workspaces.current,
        run,
      });

      dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: true }));

      if (!isInitialWorkspacesSelected.current) {
        console.log("[useWorkspaceManager.initialWorkspacesSelector] Selection started", {
          isInitialWorkspacesSelected,
          run,
        });

        // Workspaces Fetched
        // _workspaces.current.length > 0 can cause issues as it is cached copy. Remove and use server version only in case of issues
        if (_workspacesUpdatedAt.current || _workspaces.current.length > 0) {
          console.log("[useWorkspaceManager.initialWorkspacesSelector] Workspaces Fetched", {
            isInitialWorkspacesSelected,
            run,
          });

          // Cached Workspaces Previously
          if (_activeWorkspaceIds?.current && _activeWorkspaceIds.current.length > 0) {
            console.log("[useWorkspaceManager.initialWorkspacesSelector] Init using existing cached activeWorkspaces", {
              _activeWorkspaceIds: _activeWorkspaceIds.current,
              run,
            });
            isInitialWorkspacesSelected.current = true;
            await workspaceManager.initActiveWorkspaces(_activeWorkspaceIds?.current);
            // FIXME: Might be case due to some permission issues, no workspace is init. In this case switchWorkspaceModal will popup.
            // We should show some issue with workspace. Please select one
          } else {
            console.log("[useWorkspaceManager.initialWorkspacesSelector] Init using all workspaces", {
              _workspace: _workspaces.current,
              workspacesUpdatedAt: _workspacesUpdatedAt.current,
              run,
            });
            const newActiveWorkspaceId = fetchUnattemptedWorkspaceId();
            if (newActiveWorkspaceId) {
              console.log(
                "[useWorkspaceManager.initialWorkspacesSelector]  Init using all workspaces - Found a workspace",
                {
                  newActiveWorkspaceId,
                  run,
                }
              );
              isInitialWorkspacesSelected.current = true;
              await workspaceManager.initActiveWorkspaces([newActiveWorkspaceId]);
              // FIXME: Might be case due to some permission issues, no workspace is init. In this case switchWorkspaceModal will popup.
              // We should show some issue with workspace. Please select one
            } else {
              console.log(
                "[useWorkspaceManager.initialWorkspacesSelector]  Init using all workspaces - No workspace found",
                {
                  run,
                }
              );
            }
          }
        } else {
          console.log("[useWorkspaceManager.initialWorkspacesSelector] Workspaces not fetched", {
            _workspacesUpdatedAt: _workspacesUpdatedAt.current,
            run,
          });
        }

        setTimeout(() => {
          // FIXME: Incase of infinite loop, add a terminating condition and show someking of modal for the fix.
          return initialWorkspacesSelector(run + 1);
        }, 100);
      } else {
        console.log("[useWorkspaceManager.initialWorkspacesSelector] Selection already done", {
          isInitialWorkspacesSelected,
          run,
        });

        if (_activeWorkspaceIds?.current?.length === 0) {
          console.log("[useWorkspaceManager.initialWorkspacesSelector] No active workspaces", {
            _activeWorkspaceIds: _activeWorkspaceIds.current,
            run,
          });

          dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true }));
        } else {
          console.log("[useWorkspaceManager.initialWorkspacesSelector] Active workspaces found", {
            _activeWorkspaceIds: _activeWorkspaceIds.current,
            run,
          });
          dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: false }));
          dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: false }));
        }
      }
    },
    [dispatch, fetchUnattemptedWorkspaceId]
  );

  useEffect(() => {
    initialWorkspacesSelector(0);

    return () => {
      console.log("[useWorkspaceManager] userId changed. unmount. resetActiveWorkspaces");
      dispatch(workspaceActions.resetState());
      workspaceManager.resetActiveWorkspaces();

      // Reset to default states (before the useEffects triggers)
      isInitialWorkspacesSelected.current = false;
      _activeWorkspaceIds.current = [];
      _workspaces.current = [];
      _workspacesUpdatedAt.current = 0;
    };
  }, [dispatch, initialWorkspacesSelector, userId]);

  return {};
};
