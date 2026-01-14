import React from "react";
import { AnimatePresence, m } from "framer-motion";
import { WelcomeCardHeader } from "../WelcomeCardHeader/WelcomeCardHeader";
import { collapseExpandTransition } from "utils/animations";
import { MdOutlineKeyboardArrowUp } from "@react-icons/all-files/md/MdOutlineKeyboardArrowUp";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import "./apiClientOnboardCard.scss";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { LocalWorkspaceCreateOptions } from "componentsV2/modals/CreateWorkspaceModal/components/LocalWorkspaceCreationView/components/LocalWorkspaceCreateOptions/LocalWorkspaceCreateOptions";

interface CardProps {
  isExpanded: boolean;
  onExpandToggle: () => void;
  onCreateWorkspaceClick: () => void;
}

export const ApiClientOnboardCard: React.FC<CardProps> = ({ isExpanded, onExpandToggle, onCreateWorkspaceClick }) => {
  const dispatch = useDispatch();

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
                <LocalWorkspaceCreateOptions
                  analyticEventSource="desktop_onboarding"
                  onCreateWorkspaceClick={onCreateWorkspaceClick}
                  onCreationCallback={() => {
                    dispatch(globalActions.updateIsOnboardingCompleted(true));
                  }}
                />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};
