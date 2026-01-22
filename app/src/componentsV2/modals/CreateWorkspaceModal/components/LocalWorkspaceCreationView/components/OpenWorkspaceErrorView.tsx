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
        title="Workspace couldn’t be opened"
        description="We couldn’t find the workspace config file (requestly.json) in this folder. 
This error usually occurs when the wrong folder is selected, or if you've selected a subfolder instead of the workspace root."
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
