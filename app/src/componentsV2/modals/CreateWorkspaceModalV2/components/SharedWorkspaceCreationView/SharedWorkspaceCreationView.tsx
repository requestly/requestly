import { useState } from "react";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";

export const SharedWorkspaceCreationView = () => {
  const [workspaceName, setWorkspaceName] = useState("");
  return (
    <>
      <CreateWorkspaceHeader
        title="Create a new team workspace"
        description="Workspaces are where your team collaborate on rules, variables, and mocks."
        onWorkspaceNameChange={setWorkspaceName}
      />
      <CreateWorkspaceFooter />
    </>
  );
};
