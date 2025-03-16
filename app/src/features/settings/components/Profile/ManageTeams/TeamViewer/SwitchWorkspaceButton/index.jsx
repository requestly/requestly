import { SyncOutlined } from "@ant-design/icons";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Button } from "antd";
import { isWorkspacesFeatureEnabled } from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

const SwitchWorkspaceButton = ({ teamName, selectedTeamId, teamMembersCount, isTeamArchived = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  // Global State
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  let isButtonDisabled = true;
  if (!isSharedWorkspaceMode) {
    // This means there is not currently selected workspace (ie it's personal workspace)
    // Do offer user to switch the workspace
    isButtonDisabled = false;
  }
  if (activeWorkspaceId && activeWorkspaceId !== selectedTeamId) {
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
        isSyncEnabled: user?.details?.isSyncEnabled,
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
