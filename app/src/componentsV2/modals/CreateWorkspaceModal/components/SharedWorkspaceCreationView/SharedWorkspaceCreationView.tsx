import { useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox } from "antd";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { CreateWorkspaceArgs } from "../WorkspaceCreationView";
import "./sharedWorkspaceCreationView.scss";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { WorkspaceType } from "features/workspaces/types";

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

  const [workspaceName, setWorkspaceName] = useState("");
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
      <CreateWorkspaceHeader
        title="Create a new team workspace"
        description="Workspaces are where your team collaborate on rules, variables, and mocks."
        onWorkspaceNameChange={setWorkspaceName}
      />
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
