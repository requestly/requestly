import {
  clearCurrentlyActiveWorkspace,
  showSwitchWorkspaceSuccessToast,
  switchWorkspace,
} from "actions/TeamWorkspaceActions";
import PATHS from "config/constants/sub/paths";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getAppMode, getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { dummyPersonalWorkspace, getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { toast } from "utils/Toast";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";
import { ApiClientViewMode, useViewMode, useWorkspaceViewActions } from "features/apiClient/slices";
import { getWorkspaceInfo } from "features/apiClient/slices/workspaceView/utils";

//TODO: move it into top level hooks
export const useWorkspaceSwitcher = () => {
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userId = user?.details?.profile?.uid;
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isSharedWorkspace = useSelector(isActiveWorkspaceShared);

  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);

  const redirects: Record<string, string> = useMemo(
    () => ({
      rules: PATHS.RULES.MY_RULES.ABSOLUTE,
      mock: PATHS.MOCK_SERVER_V2.ABSOLUTE,
      files: PATHS.FILE_SERVER_V2.ABSOLUTE,
      sessions: PATHS.SESSIONS.ABSOLUTE,
      teams: PATHS.ACCOUNT.TEAMS.ABSOLUTE,
    }),
    []
  );

  const path: string | undefined = useMemo(
    () =>
      Object.keys(redirects).find(
        (path) =>
          pathname.includes(path) &&
          (pathname.includes("editor") ||
            pathname.includes("viewer") ||
            pathname.includes("saved") ||
            pathname.includes("/teams/"))
      ),
    [redirects, pathname]
  );

  const viewMode = useViewMode();
  const { switchContext } = useWorkspaceViewActions();

  const handleWorkspaceSwitch = useCallback(
    async (workspace: Workspace, callback?: () => any) => {
      if (viewMode === ApiClientViewMode.SINGLE) {
        if (activeWorkspace?.id === workspace.id) {
          toast.info("Workspace already selected!");
          return;
        }
      }

      setIsWorkspaceLoading(true);

      await switchContext({
        userId,
        workspace: getWorkspaceInfo(workspace),
      });

      switchWorkspace(
        {
          teamId: workspace.id,
          teamName: workspace.name,
          teamMembersCount: workspace.accessCount,
          workspaceType: workspace.workspaceType,
        },
        dispatch,
        {
          isSyncEnabled: workspace.workspaceType === WorkspaceType.SHARED ? user?.details?.isSyncEnabled : true,
          isWorkspaceMode: isSharedWorkspace,
        },
        appMode,
        undefined,
        "workspaces_dropdown"
      )
        .then(() => {
          if (!isWorkspaceLoading) {
            showSwitchWorkspaceSuccessToast(workspace.name);
          }

          callback?.();

          setIsWorkspaceLoading(false);
        })
        .catch((error) => {
          setIsWorkspaceLoading(false);
          toast.error(
            "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
          );
        });
    },
    [
      activeWorkspace?.id,
      appMode,
      dispatch,
      isSharedWorkspace,
      isWorkspaceLoading,
      switchContext,
      user?.details?.isSyncEnabled,
      userId,
      viewMode,
    ]
  );

  const confirmWorkspaceSwitch = useCallback(
    (callback = () => {}) => {
      const handleCallback = () => {
        dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(false));
        callback();

        if (path) {
          navigate(redirects[path]);
        }
      };

      if (!isCurrentlySelectedRuleHasUnsavedChanges || pathname.includes(PATHS.ACCOUNT.TEAMS.ABSOLUTE)) {
        handleCallback();
        return;
      }

      dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(true));
      Modal.confirm({
        title: "Discard changes?",
        icon: <ExclamationCircleFilled />,
        content: "Changes you made on a rule may not be saved.",
        okText: "Switch",
        onOk: handleCallback,
        afterClose: () => dispatch(globalActions.updateIsWorkspaceSwitchConfirmationActive(false)),
      });
    },
    [isCurrentlySelectedRuleHasUnsavedChanges, navigate, path, pathname, redirects, dispatch]
  );

  const handleSwitchToPrivateWorkspace = useCallback(async () => {
    if (viewMode === ApiClientViewMode.SINGLE) {
      if (activeWorkspace?.id === null) {
        toast.info("Workspace already selected!");
        return;
      }
    }
    setIsWorkspaceLoading(true);
    await switchContext({
      userId,
      workspace: { id: dummyPersonalWorkspace.id, meta: { type: WorkspaceType.PERSONAL } },
    });

    return clearCurrentlyActiveWorkspace(dispatch, appMode)
      .then(() => {
        showSwitchWorkspaceSuccessToast();
      })
      .catch(() => {
        toast.error(
          "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
        );
      })
      .finally(() => {
        setIsWorkspaceLoading(false);
      });
  }, [viewMode, switchContext, userId, dispatch, appMode, activeWorkspace?.id]);

  return {
    handleWorkspaceSwitch,
    confirmWorkspaceSwitch,
    handleSwitchToPrivateWorkspace,

    isWorkspaceLoading,
    setIsWorkspaceLoading,
  };
};
