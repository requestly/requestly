import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { WorkspaceItem } from "./components/WorkspaceListItem/WorkspaceListItem";
import { Invite } from "types";
import { Divider } from "antd";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { WorkspaceList } from "./components/WorkspaceList/WorkspaceList";
import { MdOutlineGroups } from "@react-icons/all-files/md/MdOutlineGroups";
import { globalActions } from "store/slices/global/slice";
import { trackWorkspaceJoiningModalOpened } from "modules/analytics/events/features/teams";
import LoadingModal from "../LoadingModal";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { EmptyWorkspaceListView } from "./components/EmptyWorkspaceListView/EmptyWorkspaceListView";
import { CommonEmptyView } from "./components/CommonEmptyView/CommonEmptyView";
import { useWorkspaceSwitcher } from "features/apiClient/screens/apiClient/components/sidebar/MultiWorkspaceSidebar/WorkspaceProvider/useWorkspaceSwitcher";
import "./workspacesOverlay.scss";

interface WorkspacesOverlayProps {
  toggleDropdown: () => void;
  teamInvites: Invite[];
}

interface WorkspaceListSectionProps {
  workspaces: Workspace[];
  workspaceType: WorkspaceType;
  toggleDropdown: () => void;
  onItemClick: (workspace: Workspace, callback?: () => any) => void;
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
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);

  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const {
    handleWorkspaceSwitch,
    confirmWorkspaceSwitch,
    handleSwitchToPrivateWorkspace,
    isWorkspaceLoading,
    setIsWorkspaceLoading,
  } = useWorkspaceSwitcher();

  const sortedAvailableWorkspaces = useMemo(() => {
    const filteredWorkspaces = (availableWorkspaces || []).filter(
      (team) => !team.browserstackDetails && !team?.archived
    );

    return filteredWorkspaces;
  }, [availableWorkspaces]);

  const workspaceMap = useMemo(() => {
    let map: { [key in WorkspaceType]: Workspace[] } = {
      [WorkspaceType.LOCAL_STORAGE]: [],
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
                onItemClick={(workspace, addWorkspaceToView) =>
                  confirmWorkspaceSwitch(() => handleWorkspaceSwitch(workspace, addWorkspaceToView))
                }
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

      {isWorkspaceLoading ? (
        <LoadingModal isModalOpen={isWorkspaceLoading} closeModal={() => setIsWorkspaceLoading(false)} />
      ) : null}
    </>
  );
};
