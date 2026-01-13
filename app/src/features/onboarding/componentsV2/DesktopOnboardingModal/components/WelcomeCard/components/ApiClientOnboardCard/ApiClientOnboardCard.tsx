import React from "react";
import { AnimatePresence, m } from "framer-motion";
import { WelcomeCardHeader } from "../WelcomeCardHeader/WelcomeCardHeader";
import { collapseExpandTransition } from "utils/animations";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { Tooltip } from "antd";
import clsx from "clsx";
import { IoMdArrowForward } from "@react-icons/all-files/io/IoMdArrowForward";
import { MdOutlineKeyboardArrowUp } from "@react-icons/all-files/md/MdOutlineKeyboardArrowUp";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import "./apiClientOnboardCard.scss";

enum WorkspaceCreationMode {
  QUICK_START = "quick_start",
  CREATE = "create",
  OPEN = "open",
}

interface CardProps {
  isExpanded: boolean;
  onExpandToggle: () => void;
  onCreateWorkspaceClick: () => void;
}

interface OptionsProps {
  onCreateWorkspaceClick: () => void;
}

const ApiClientOnboardCardOptions: React.FC<OptionsProps> = ({ onCreateWorkspaceClick }) => {
  const options = [
    {
      id: WorkspaceCreationMode.QUICK_START,
      title: "Quick Start",
      info: "Skip the setup. Your APIs will be managed in the Documents folder.",
      isPrimary: true,
      onClick: () => {},
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
      info: "Already have a workspace? Select the folder to continue working.",
      onClick: () => {},
    },
  ];

  return options.map((option) => (
    <div
      key={option.id}
      className={clsx(
        "api-client-onboard-card__option",
        option.isPrimary && "api-client-onboard-card__option--primary"
      )}
      onClick={(e) => {
        e.stopPropagation();
        option.onClick();
      }}
    >
      <div className="api-client-onboard-card__option-title">
        {option.icon}
        {option.title}
        <Tooltip title={option.info} color="#000" placement="right">
          <MdInfoOutline />
        </Tooltip>
      </div>
      {option.id === WorkspaceCreationMode.QUICK_START && (
        <span className="api-client-onboard-card__option-arrow">
          <IoMdArrowForward />
        </span>
      )}
    </div>
  ));
};

export const ApiClientOnboardCard: React.FC<CardProps> = ({ isExpanded, onExpandToggle, onCreateWorkspaceClick }) => {
  return (
    <m.div
      layout
      transition={{
        layout: {
          duration: 0.25,
          ease: "easeInOut",
        },
      }}
    >
      <div className="api-client-onboard-card welcome-card-option" onClick={onExpandToggle}>
        <div className="api-client-onboard-card__header">
          <WelcomeCardHeader
            title="Start using API Client"
            description={!isExpanded ? "Create, manage, and test APIs with collections and reusable variables." : null}
            iconSrc={"/assets/media/apiClient/api-client-icon.svg"}
          />
          {isExpanded ? (
            <MdOutlineKeyboardArrowUp className="api-client-onboard-card__arrow" />
          ) : (
            <MdOutlineKeyboardArrowDown className="api-client-onboard-card__arrow" />
          )}
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <m.div {...collapseExpandTransition}>
              <div className="api-client-onboard-card__options-container">
                <ApiClientOnboardCardOptions onCreateWorkspaceClick={onCreateWorkspaceClick} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};
