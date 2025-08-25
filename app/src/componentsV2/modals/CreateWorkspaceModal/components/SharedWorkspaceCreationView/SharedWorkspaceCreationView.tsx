import { useState } from "react";
import { useDispatch } from "react-redux";
import { Checkbox } from "antd";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { globalActions } from "store/slices/global/slice";
import { CreateWorkspaceArgs } from "../../CreateWorkspaceModal";
import { WorkspaceType } from "types";
import "./sharedWorkspaceCreationView.scss";

export const SharedWorkspaceCreationView = ({
  onCreateWorkspaceClick,
  isLoading,
}: {
  onCreateWorkspaceClick: (args: CreateWorkspaceArgs) => void;
  isLoading: boolean;
}) => {
  const dispatch = useDispatch();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isNotifyAllSelected, setIsNotifyAllSelected] = useState(false);

  const handleOnCancel = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: false }));
  };

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
        <span className="invite-all-domain-users-text">Notify all requestly.io users to join this workspace.</span>
      </div>
      <CreateWorkspaceFooter
        onCancel={handleOnCancel}
        onCreateWorkspaceClick={handleOnCreateWorkspaceClick}
        isLoading={isLoading}
      />
    </>
  );
};
