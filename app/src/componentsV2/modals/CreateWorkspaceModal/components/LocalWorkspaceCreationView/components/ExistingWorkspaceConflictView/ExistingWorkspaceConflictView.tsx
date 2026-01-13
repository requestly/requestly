import React from "react";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { RiExternalLinkLine } from "@react-icons/all-files/ri/RiExternalLinkLine";
import { RQButton } from "lib/design-system-v2/components";
import { openPathInFileExplorer } from "components/mode-specific/desktop/misc/FileDialogButton";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { WorkspacePathEllipsis } from "features/workspaces/components/WorkspacePathEllipsis";
import "./existingWorkspaceConflictView.scss";

interface Props {
  path: string;
  onChooseAnotherFolder: () => void;
}

export const ExistingWorkspaceConflictView: React.FC<Props> = ({ path, onChooseAnotherFolder }) => {
  return (
    <>
      <div className="existing-workspace-conflict-view__header">
        <MdInfoOutline /> Workspace already exists in this folder
      </div>
      <div className="existing-workspace-conflict-view__description">
        This folder already contains Requestly workspace files. You can continue using the existing workspace or choose
        a different folder.
      </div>
      <div className="existing-workspace-conflict-view__path">
        <PiFolderOpen />
        <WorkspacePathEllipsis path={path} className="existing-workspace-conflict-view__path-text" />
        <RiExternalLinkLine className="cursor-pointer" onClick={() => openPathInFileExplorer(path)} />
      </div>
      <div className="existing-workspace-conflict-view__actions">
        <RQButton onClick={onChooseAnotherFolder}>Choose another folder</RQButton>

        {/* TO BE IMPLEMENTED */}
        <RQButton type="primary">Use existing workspace</RQButton>
      </div>
    </>
  );
};
