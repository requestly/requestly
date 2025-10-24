import { SyncOutlined } from "@ant-design/icons";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Button } from "antd";
import { WorkspaceType } from "features/workspaces/types";
import { isWorkspacesFeatureEnabled } from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector/WorkspaceSelector";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

const SwitchWorkspaceButton = ({ teamName, selectedTeamId, teamMembersCount, isTeamArchived = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  // Global State
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  let isButtonDisabled = true;
  if (!isSharedWorkspaceMode) {
    // This means there is not currently selected workspace (ie it's personal workspace)
    // Do offer user to switch the workspace
    isButtonDisabled = false;
  }
  if (activeWorkspace?.id && activeWorkspace?.id !== selectedTeamId) {
    // This means user has current selected a workspace that it different from what we're showing him rn on screen
    isButtonDisabled = false;
  }

  if (!isWorkspacesFeatureEnabled(user?.details?.profile?.email)) {
    return null;
  }

  const handleSwitchWorkspace = () => {
    switchWorkspace(
      {
        teamId: selectedTeamId,
        teamName,
        teamMembersCount,
      },
      dispatch,
      {
        isSyncEnabled: activeWorkspace.workspaceType === WorkspaceType.SHARED ? user?.details?.isSyncEnabled : true,
        isWorkspaceMode: isSharedWorkspaceMode,
      },
      appMode
    );
  };

  return (
    <Button type="primary" disabled={isButtonDisabled || isTeamArchived} onClick={handleSwitchWorkspace}>
      <SyncOutlined /> Switch to this workspace
    </Button>
  );
};

export default SwitchWorkspaceButton;
