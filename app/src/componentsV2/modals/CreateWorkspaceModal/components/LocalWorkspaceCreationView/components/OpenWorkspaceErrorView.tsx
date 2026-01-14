import React from "react";
import { RQButton } from "lib/design-system-v2/components";
import { WorkspaceCreationErrorView } from "./WorkspaceCreationErrorView/WorkspaceCreationErrorView";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";

interface Props {
  path: string;
  onNewWorkspaceClick: () => void;
  openWorkspace: (workspacePath: string) => void;
  isOpeningWorkspaceLoading: boolean;
}

export const OpenWorkspaceErrorView: React.FC<Props> = ({
  path,
  onNewWorkspaceClick,
  openWorkspace,
  isOpeningWorkspaceLoading,
}) => {
  return (
    <>
      <WorkspaceCreationErrorView
        title="Workspace already exists in this folder"
        description="This folder already contains Requestly workspace files. You can continue using the existing workspace or choose a different folder."
        path={path}
        actions={
          <>
            <RQButton onClick={onNewWorkspaceClick}>Create a new workspace here</RQButton>
            <RQButton
              type="primary"
              onClick={() => displayFolderSelector((folderPath: string) => openWorkspace(folderPath))}
              loading={isOpeningWorkspaceLoading}
            >
              Select another folder
            </RQButton>
          </>
        }
      />
    </>
  );
};
