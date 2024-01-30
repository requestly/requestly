import { SyncOutlined } from "@ant-design/icons";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { Button } from "antd";
import { isWorkspacesFeatureEnabled } from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "store/selectors";

const SwitchWorkspaceButton = ({ teamName, selectedTeamId, teamMembersCount, isTeamArchived = false }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  // Global State
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  let isButtonDisabled = true;
  if (!isWorkspaceMode) {
    // This means there is not currently selected workspace (ie it's personal workspace)
    // Do offer user to switch the workspace
    isButtonDisabled = false;
  }
  if (currentlyActiveWorkspace?.id && currentlyActiveWorkspace.id !== selectedTeamId) {
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
        isWorkspaceMode,
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
