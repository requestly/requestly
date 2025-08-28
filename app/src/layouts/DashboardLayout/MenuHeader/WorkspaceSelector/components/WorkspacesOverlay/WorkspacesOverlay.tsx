import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getAppMode, getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { WorkspaceItem } from "./components/WorkspaceListItem/WorkspaceListItem";
import { Invite, WorkspaceType } from "types";
import { Divider, Modal } from "antd";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import { Workspace } from "features/workspaces/types";
import { WorkspaceList } from "./components/WorkspaceList/WorkspaceList";
import { MdOutlineGroups } from "@react-icons/all-files/md/MdOutlineGroups";
import { globalActions } from "store/slices/global/slice";
import { trackWorkspaceJoiningModalOpened } from "modules/analytics/events/features/teams";
import LoadingModal from "../LoadingModal";
import {
  clearCurrentlyActiveWorkspace,
  showSwitchWorkspaceSuccessToast,
  switchWorkspace,
} from "actions/TeamWorkspaceActions";
import { toast } from "utils/Toast";
import { ExclamationCircleFilled } from "@ant-design/icons";
import PATHS from "config/constants/sub/paths";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { EmptyWorkspaceListView } from "./components/EmptyWorkspaceListView/EmptyWorkspaceListView";
import { CommonEmptyView } from "./components/CommonEmptyView/CommonEmptyView";
import { isSharedWorkspace } from "features/workspaces/utils";
import "./workspacesOverlay.scss";

interface WorkspacesOverlayProps {
  toggleDropdown: () => void;
  teamInvites: Invite[];
}

interface WorkspaceListSectionProps {
  workspaces: Workspace[];
  workspaceType: WorkspaceType;
  toggleDropdown: () => void;
  onItemClick: (workspace: Workspace) => void;
}

const EmptyWorkspaceListSection = ({
  workspaceType,
  toggleDropdown,
}: {
  workspaceType: WorkspaceType;
  toggleDropdown: () => void;
}) => {
  return (
    <div>
      <Divider />
      <EmptyWorkspaceListView workspaceType={workspaceType} toggleDropdown={toggleDropdown} />
    </div>
  );
};

const WorkspaceListSection: React.FC<WorkspaceListSectionProps> = ({
  workspaces,
  workspaceType,
  toggleDropdown,
  onItemClick,
}: WorkspaceListSectionProps) => {
  const user = useSelector(getUserAuthDetails);
  if (!workspaces.length) {
    return <EmptyWorkspaceListSection workspaceType={workspaceType} toggleDropdown={toggleDropdown} />;
  }
  return (
    <div>
      {user.loggedIn ? <Divider /> : null}
      <WorkspaceList
        workspaces={workspaces}
        type={workspaceType}
        toggleDropdown={toggleDropdown}
        onItemClick={onItemClick}
      />{" "}
    </div>
  );
};

export const WorkspacesOverlay: React.FC<WorkspacesOverlayProps> = ({ toggleDropdown, teamInvites }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const { pathname } = useLocation();
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);

  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const sortedAvailableWorkspaces = useMemo(() => {
    const filteredWorkspaces = (availableWorkspaces || []).filter(
      (team) => !team.browserstackDetails && !team?.archived
    );

    return filteredWorkspaces;
  }, [availableWorkspaces]);

  const workspaceMap = useMemo(() => {
    let map: { [key in WorkspaceType]: Workspace[] } = {
      [WorkspaceType.LOCAL]: [],
      [WorkspaceType.SHARED]: [],
      [WorkspaceType.PERSONAL]: [],
    };
    return sortedAvailableWorkspaces.reduce((acc, workspace) => {
      if (workspace.workspaceType) {
        const key = workspace.workspaceType as keyof typeof acc;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(workspace);
      }
      return acc;
    }, map);
  }, [sortedAvailableWorkspaces]);

  const hasLocalWorkspaces = workspaceMap[WorkspaceType.LOCAL].length > 0;
  const hasSharedWorkspaces = workspaceMap[WorkspaceType.SHARED].length;

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

  const handleJoinWorkspaceMenuItemClick = () => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "joinWorkspaceModal",
        newValue: true,
        newProps: { source: "workspaces_dropdown" },
      })
    );
    toggleDropdown();
    trackWorkspaceJoiningModalOpened(teamInvites?.length, "workspaces_dropdown");
  };

  const handleSwitchToPrivateWorkspace = useCallback(async () => {
    setIsLoadingModalOpen(true);
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
        setIsLoadingModalOpen(false);
      });
  }, [appMode, dispatch]);

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    setIsLoadingModalOpen(true);
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
        if (!isLoadingModalOpen) showSwitchWorkspaceSuccessToast(workspace.name);
        setIsLoadingModalOpen(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoadingModalOpen(false);
        toast.error(
          "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
        );
      });
  };

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

  return (
    <>
      <div className="workspaces-overlay">
        {user.loggedIn && (
          <>
            <div
              style={{
                margin: "0 4px",
              }}
            >
              <WorkspaceItem
                type={WorkspaceType.PERSONAL}
                toggleDropdown={toggleDropdown}
                onClick={() => confirmWorkspaceSwitch(handleSwitchToPrivateWorkspace)}
              />
            </div>
          </>
        )}

        {!hasLocalWorkspaces && !hasSharedWorkspaces ? (
          <>
            {user.loggedIn ? <Divider /> : null}
            <CommonEmptyView toggleDropdown={toggleDropdown} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: !hasLocalWorkspaces ? "column-reverse" : "column" }}>
            {isLocalSyncEnabled ? (
              <WorkspaceListSection
                workspaces={workspaceMap[WorkspaceType.LOCAL]}
                workspaceType={WorkspaceType.LOCAL}
                toggleDropdown={toggleDropdown}
                onItemClick={(workspace) => confirmWorkspaceSwitch(() => handleWorkspaceSwitch(workspace))}
              />
            ) : null}

            <WorkspaceListSection
              workspaces={workspaceMap[WorkspaceType.SHARED]}
              workspaceType={WorkspaceType.SHARED}
              toggleDropdown={toggleDropdown}
              onItemClick={(workspace) => confirmWorkspaceSwitch(() => handleWorkspaceSwitch(workspace))}
            />
          </div>
        )}

        {user.loggedIn ? (
          <>
            <Divider />
            <div
              className="workspace-overlay__list-item join-workspace-item"
              onClick={handleJoinWorkspaceMenuItemClick}
            >
              <MdOutlineGroups />
              <span className="workspace-list-item-name">
                Join a workspace{" "}
                {teamInvites.length ? <span className="join-workspace-item__badge">{teamInvites.length}</span> : null}
              </span>
            </div>
          </>
        ) : null}
      </div>
      {isLoadingModalOpen ? (
        <LoadingModal isModalOpen={isLoadingModalOpen} closeModal={() => setIsLoadingModalOpen(false)} />
      ) : null}
    </>
  );
};
