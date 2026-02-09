import { useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, Input } from "antd";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { CreateWorkspaceArgs } from "features/workspaces/hooks/useCreateWorkspace";
import "./sharedWorkspaceCreationView.scss";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { WorkspaceType } from "features/workspaces/types";
import { useWorkspaceCreationContext } from "../../context";

export const SharedWorkspaceCreationView = ({
  onCreateWorkspaceClick,
  isLoading,
  onCancel,
}: {
  onCreateWorkspaceClick: (args: CreateWorkspaceArgs) => void;
  isLoading: boolean;
  onCancel: () => void;
}) => {
  const user = useSelector(getUserAuthDetails);
  const { workspaceName, setWorkspaceName } = useWorkspaceCreationContext();

  const [isNotifyAllSelected, setIsNotifyAllSelected] = useState(false);

  const handleOnCreateWorkspaceClick = () => {
    onCreateWorkspaceClick({
      workspaceType: WorkspaceType.SHARED,
      workspaceName,
      isNotifyAllSelected,
    });
  };

  return (
    <>
      <div className="create-workspace-header">
        <div className="create-workspace-header__title">Create a new team workspace</div>
        <div className="create-workspace-header__description">
          Workspaces are where your team collaborate on rules, variables, and mocks.
        </div>
        <label htmlFor="workspace-name" className="create-workspace-header__label">
          Workspace name
        </label>
        <Input
          autoFocus
          value={workspaceName}
          id="workspace-name"
          className="create-workspace-header__input"
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
      </div>
      <div className="invite-all-domain-users-container">
        <Checkbox checked={isNotifyAllSelected} onChange={() => setIsNotifyAllSelected(!isNotifyAllSelected)} />{" "}
        <span className="invite-all-domain-users-text">
          Notify all {getDomainFromEmail(user.details?.profile?.email)} users to join this workspace.
        </span>
      </div>
      <CreateWorkspaceFooter
        onCancel={onCancel}
        onCreateWorkspaceClick={handleOnCreateWorkspaceClick}
        isLoading={isLoading}
        disabled={!workspaceName.length}
      />
    </>
  );
};
