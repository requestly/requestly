import React from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { WorkspacePathEllipsis } from "features/workspaces/components/WorkspacePathEllipsis";
import { RiExternalLinkLine } from "@react-icons/all-files/ri/RiExternalLinkLine";
import { openPathInFileExplorer } from "components/mode-specific/desktop/misc/FileDialogButton";
import "./workspaceCreationErrorView.scss";

interface Props {
  title: string;
  path: string;
  description: string;
  actions: React.ReactNode;
}

export const WorkspaceCreationErrorView: React.FC<Props> = ({ title, description, path, actions }) => {
  return (
    <>
      <div className="workspace-creation-error-view__header">
        <MdInfoOutline /> {title}
      </div>
      <div className="workspace-creation-error-view__description">{description}</div>
      <div className="workspace-creation-error-view__path">
        <PiFolderOpen />
        <WorkspacePathEllipsis path={path} className="workspace-creation-error-view__path-text" />
        <RiExternalLinkLine className="cursor-pointer" onClick={() => openPathInFileExplorer(path)} />
      </div>
      <div className="workspace-creation-error-view__actions">{actions}</div>
    </>
  );
};
