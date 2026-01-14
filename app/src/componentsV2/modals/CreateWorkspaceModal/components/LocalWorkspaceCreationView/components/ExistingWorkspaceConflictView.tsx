import React from "react";
import { WorkspaceCreationErrorView } from "./WorkspaceCreationErrorView/WorkspaceCreationErrorView";
import { RQButton } from "lib/design-system-v2/components";

interface Props {
  path: string;
  onChooseAnotherFolder: () => void;
}

export const ExistingWorkspaceConflictView: React.FC<Props> = ({ path, onChooseAnotherFolder }) => {
  return (
    <>
      <WorkspaceCreationErrorView
        title="Workspace already exists in this folder"
        description="This folder already contains Requestly workspace files. You can continue using the existing workspace or choose a different folder."
        path={path}
        actions={
          <>
            <RQButton onClick={onChooseAnotherFolder}>Choose another folder</RQButton>
            <RQButton type="primary">Use existing workspace</RQButton>
          </>
        }
      />
    </>
  );
};
