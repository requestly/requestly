import { showSwitchWorkspaceSuccessToast } from "actions/TeamWorkspaceActions";
import PATHS from "config/constants/sub/paths";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { Workspace } from "features/workspaces/types";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { toast } from "utils/Toast";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";

//TODO: move it into top level hooks
export const useWorkspaceSwitcher = () => {
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeWorkspace = useSelector(getActiveWorkspace);
  const { switchWorkspace } = useWorkspaceHelpers();

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

  const [getViewMode] = useApiClientMultiWorkspaceView((s) => [s.getViewMode, s.getAllSelectedWorkspaces]);

  const handleWorkspaceSwitch = useCallback(
    async (workspace: Workspace) => {
      const viewMode = getViewMode();

      if (viewMode === ApiClientViewMode.SINGLE) {
        if (activeWorkspace?.id === workspace.id) {
          toast.info("Workspace already selected!");
          return;
        }
      }

      setIsWorkspaceLoading(true);
      switchWorkspace(workspace.id)
        .then(() => {
          if (!isWorkspaceLoading) {
            showSwitchWorkspaceSuccessToast(workspace.name);
          }

          setIsWorkspaceLoading(false);
        })
        .catch((error) => {
          setIsWorkspaceLoading(false);
          toast.error(
            "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
          );
        });
    },
    [activeWorkspace?.id, getViewMode, isWorkspaceLoading, switchWorkspace]
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

  return {
    handleWorkspaceSwitch,
    confirmWorkspaceSwitch,
    isWorkspaceLoading,
    setIsWorkspaceLoading,
  };
};
