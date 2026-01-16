import React, { useMemo } from "react";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { IoMdArrowForward } from "@react-icons/all-files/io/IoMdArrowForward";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { Tooltip } from "antd";
import clsx from "clsx";
import { useCreateDefaultLocalWorkspace } from "features/workspaces/hooks/useCreateDefaultLocalWorkspace";
import { RQButton } from "lib/design-system-v2/components";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import "./localWorkspaceCreateOptions.scss";

enum WorkspaceCreationMode {
  QUICK_START = "quick_start",
  CREATE = "create",
  OPEN = "open",
}

interface OptionsProps {
  analyticEventSource: string;
  openWorkspace: (workspacePath: string) => void;
  isOpeningWorkspaceLoading: boolean;
  isOpenedInModal?: boolean;
  onCreateWorkspaceClick: () => void;
  onCreationCallback?: () => void;
}

export const LocalWorkspaceCreateOptions: React.FC<OptionsProps> = ({
  onCreateWorkspaceClick,
  onCreationCallback,
  openWorkspace,
  isOpeningWorkspaceLoading,
  analyticEventSource,
  isOpenedInModal = false,
}) => {
  const { createWorkspace, isLoading } = useCreateDefaultLocalWorkspace({
    analyticEventSource,
    onCreateWorkspaceCallback: onCreationCallback,
  });

  const options = useMemo(
    () => [
      {
        id: WorkspaceCreationMode.QUICK_START,
        title: "Quick Start",
        info: "Skip the setup. Your APIs will be managed in the Documents folder.",
        isPrimary: true,
        hidden: isOpenedInModal,
        isLoading,
        onClick: createWorkspace,
      },
      {
        id: WorkspaceCreationMode.CREATE,
        title: "Create a new workspace",
        icon: <IoMdAdd />,
        info: "Choose where you want to store your project files and data.",
        onClick: onCreateWorkspaceClick,
      },
      {
        id: WorkspaceCreationMode.OPEN,
        title: "Open existing workspace",
        icon: <PiFolderOpen />,
        isLoading: isOpeningWorkspaceLoading,
        info: "Already have a workspace? Select the folder to continue working.",
        onClick: () => displayFolderSelector((folderPath: string) => openWorkspace(folderPath)),
      },
    ],
    [isOpenedInModal, onCreateWorkspaceClick, isLoading, createWorkspace, openWorkspace, isOpeningWorkspaceLoading]
  );

  return (
    <div className="local-workspace-create-options__options-container">
      {options
        .filter((option) => !option.hidden)
        .map((option) => (
          <RQButton
            size="large"
            block
            key={option.id}
            className={clsx(
              "local-workspace-create-options__option",
              option.isPrimary && "local-workspace-create-options__option--primary"
            )}
            loading={option.isLoading}
            onClick={(e) => {
              e.stopPropagation();
              option.onClick();
            }}
          >
            <div className="local-workspace-create-options__option-title">
              {option.icon}
              {option.title}
              <Tooltip title={option.info} color="#000" placement="right">
                <MdInfoOutline />
              </Tooltip>
            </div>
            {option.id === WorkspaceCreationMode.QUICK_START && (
              <span className="local-workspace-create-options__option-arrow">
                <IoMdArrowForward />
              </span>
            )}
          </RQButton>
        ))}
    </div>
  );
};
