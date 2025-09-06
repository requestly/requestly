import { SyncOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import { isWorkspacesFeatureEnabled } from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector/WorkspaceSelector";
import React from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

const SwitchWorkspaceButton = ({ teamName, selectedTeamId, teamMembersCount, isTeamArchived = false }) => {
  const user = useSelector(getUserAuthDetails);
  // Global State
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const { switchWorkspace } = useWorkspaceHelpers();

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
    switchWorkspace(selectedTeamId);
  };

  return (
    <Button type="primary" disabled={isButtonDisabled || isTeamArchived} onClick={handleSwitchWorkspace}>
      <SyncOutlined /> Switch to this workspace
    </Button>
  );
};

export default SwitchWorkspaceButton;
