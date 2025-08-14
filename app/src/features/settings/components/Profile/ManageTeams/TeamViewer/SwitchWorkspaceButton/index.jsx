import { SyncOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import React from "react";
import { useSelector } from "react-redux";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";

const SwitchWorkspaceButton = ({ teamName, selectedTeamId, teamMembersCount, isTeamArchived = false }) => {
  // Global State
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);

  const { switchWorkspace } = useWorkspaceHelpers();

  let isButtonDisabled = activeWorkspaceIds?.includes(selectedTeamId) ? true : false;

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
