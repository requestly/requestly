import React, { useCallback, useMemo } from "react";
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
import { trackDesktopOnboardingFeatureSelected } from "features/onboarding/componentsV2/DesktopOnboardingModal/analytics";
import {
  trackLocalWorkspaceCreationModeSelected,
  trackNewTeamCreationWorkflowStarted,
} from "modules/analytics/events/common/teams";

enum LocalWorkspaceCreationMode {
  QUICK_START = "quick_start",
  CREATE_WORKSPACE = "create_workspace",
  OPEN_EXISTING_WORKSPACE = "open_existing_workspace",
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

  const handleOptionClick = useCallback(
    (mode: LocalWorkspaceCreationMode) => {
      if (analyticEventSource === "desktop_onboarding_modal") {
        trackDesktopOnboardingFeatureSelected(mode);
      }

      trackNewTeamCreationWorkflowStarted("local", analyticEventSource);
      trackLocalWorkspaceCreationModeSelected(mode, analyticEventSource);
    },
    [analyticEventSource]
  );

  const options = useMemo(
    () => [
      {
        id: LocalWorkspaceCreationMode.QUICK_START,
        title: "Quick Start",
        info: "Skip the setup. Your APIs will be managed in the Documents folder.",
        isPrimary: true,
        hidden: isOpenedInModal,
        isLoading,
        onClick: () => {
          handleOptionClick(LocalWorkspaceCreationMode.QUICK_START);
          createWorkspace();
        },
      },
      {
        id: LocalWorkspaceCreationMode.CREATE_WORKSPACE,
        title: "Create a new workspace",
        icon: <IoMdAdd />,
        info: "Choose where you want to store your project files and data.",
        onClick: () => {
          handleOptionClick(LocalWorkspaceCreationMode.CREATE_WORKSPACE);
          onCreateWorkspaceClick();
        },
      },
      {
        id: LocalWorkspaceCreationMode.OPEN_EXISTING_WORKSPACE,
        title: "Open existing workspace",
        icon: <PiFolderOpen />,
        isLoading: isOpeningWorkspaceLoading,
        info: "Already have a workspace? Select the folder to continue working.",
        onClick: () => {
          handleOptionClick(LocalWorkspaceCreationMode.OPEN_EXISTING_WORKSPACE);
          displayFolderSelector((folderPath: string) => openWorkspace(folderPath));
        },
      },
    ],
    [
      isOpenedInModal,
      onCreateWorkspaceClick,
      isLoading,
      createWorkspace,
      openWorkspace,
      isOpeningWorkspaceLoading,
      handleOptionClick,
    ]
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
            {option.id === LocalWorkspaceCreationMode.QUICK_START && !option.isLoading && (
              <span className="local-workspace-create-options__option-arrow">
                <IoMdArrowForward />
              </span>
            )}
          </RQButton>
        ))}
    </div>
  );
};
