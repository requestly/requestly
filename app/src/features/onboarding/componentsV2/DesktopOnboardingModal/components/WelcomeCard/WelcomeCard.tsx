import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import RQOnlyLogo from "/assets/media/common/RQ-only-logo.svg";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { trackDesktopOnboardingFeatureSelected, trackDesktopOnboardingStepSkipped } from "../../analytics";
import { OnboardingStep } from "../../types";
import { WelcomeCardHeader } from "./components/WelcomeCardHeader/WelcomeCardHeader";
import { AnimatePresence, m } from "framer-motion";
import { collapseExpandTransition } from "utils/animations";
import { MdOutlineKeyboardArrowUp } from "@react-icons/all-files/md/MdOutlineKeyboardArrowUp";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { LocalWorkspaceCreateOptions } from "componentsV2/modals/CreateWorkspaceModal";
import clsx from "clsx";
import { useCreateDefaultLocalWorkspace } from "features/workspaces/hooks/useCreateDefaultLocalWorkspace";
import { FileSystemError } from "features/apiClient/helpers/modules/sync/local/services/types";
import { OpenWorkspaceErrorView } from "componentsV2/modals/CreateWorkspaceModal/components/LocalWorkspaceCreationView/components/OpenWorkspaceErrorView";
import { useOpenLocalWorkspace } from "features/workspaces/hooks/useOpenLocalWorkspace";
import { MdOutlineKeyboardArrowRight } from "@react-icons/all-files/md/MdOutlineKeyboardArrowRight";
import "./welcomeCard.scss";
import { useNavigate } from "react-router-dom";
import { redirectToApiClient } from "utils/RedirectionUtils";

interface Props {
  onFeatureClick: (step: OnboardingStep) => void;
}

export const WelcomeCard: React.FC<Props> = ({ onFeatureClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isApiClientCardExpanded, setIsApiClientCardExpanded] = useState(false);
  const [openWorkspaceError, setOpenWorkspaceError] = useState<FileSystemError | null>(null);
  const apiClientCardRef = useRef<HTMLDivElement | null>(null);

  const { createWorkspace, isLoading } = useCreateDefaultLocalWorkspace({
    analyticEventSource: "desktop_onboarding_modal",
    onCreateWorkspaceCallback: () => {
      trackDesktopOnboardingStepSkipped(OnboardingStep.FEATURE_SELECTION);
      dispatch(globalActions.updateIsOnboardingCompleted(true));
      redirectToApiClient(navigate);
    },
  });

  const { openWorkspace, isLoading: isOpeningWorkspaceLoading } = useOpenLocalWorkspace({
    analyticEventSource: "desktop_onboarding_modal",
    onOpenWorkspaceCallback: () => {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
      redirectToApiClient(navigate);
    },
    onError: (error: FileSystemError) => {
      setOpenWorkspaceError(error);
    },
  });

  useEffect(() => {
    if (!isApiClientCardExpanded) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (apiClientCardRef.current && !apiClientCardRef.current.contains(event.target as Node)) {
        setIsApiClientCardExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isApiClientCardExpanded]);

  const handleApiClientCardExpandToggle = () => {
    if (!isApiClientCardExpanded) {
      trackDesktopOnboardingFeatureSelected("api_client");
    }
    setIsApiClientCardExpanded((prev) => !prev);
  };

  if (openWorkspaceError) {
    return (
      <div style={{ padding: 24 }}>
        <OpenWorkspaceErrorView
          path={openWorkspaceError.error.path}
          onNewWorkspaceClick={() => onFeatureClick(OnboardingStep.FOLDER_SELECTION)}
          openWorkspace={openWorkspace}
          isOpeningWorkspaceLoading={isOpeningWorkspaceLoading}
          analyticEventSource="desktop_onboarding_modal"
        />
      </div>
    );
  }

  return (
    <div className="welcome-card__cover">
      <img src={RQOnlyLogo} alt="RQ Only Logo" className={clsx(isApiClientCardExpanded && "fade-out")} />
      <div
        className={clsx("rq-desktop-onboarding-modal-content__card-header", isApiClientCardExpanded && "fade-out")}
        style={{ marginTop: "24px" }}
      >
        Welcome to Requestly
      </div>
      <div
        className={clsx("rq-desktop-onboarding-modal-content__card-description", isApiClientCardExpanded && "fade-out")}
      >
        Intercept, Mock, Build & Test APIs faster
      </div>
      <div className="welcome-options">
        <m.div
          layout
          transition={{
            layout: {
              duration: 0.25,
              ease: "easeInOut",
            },
          }}
        >
          <div
            ref={apiClientCardRef}
            className="api-client-onboard-card welcome-card-option"
            onClick={handleApiClientCardExpandToggle}
          >
            <div className="api-client-onboard-card__header">
              <WelcomeCardHeader
                title="Start using API Client"
                description={
                  !isApiClientCardExpanded
                    ? "Create, manage, and test APIs with collections and reusable variables."
                    : null
                }
                iconSrc={"/assets/media/apiClient/api-client-icon.svg"}
              />
              {isApiClientCardExpanded ? (
                <MdOutlineKeyboardArrowUp className="api-client-onboard-card__arrow" />
              ) : (
                <MdOutlineKeyboardArrowDown className="api-client-onboard-card__arrow" />
              )}
            </div>
            <AnimatePresence initial={false}>
              {isApiClientCardExpanded && (
                <m.div {...collapseExpandTransition}>
                  <div className="api-client-onboard-card__options-container">
                    <LocalWorkspaceCreateOptions
                      analyticEventSource="desktop_onboarding_modal"
                      onCreateWorkspaceClick={() => onFeatureClick(OnboardingStep.FOLDER_SELECTION)}
                      onCreationCallback={() => {
                        dispatch(globalActions.updateIsOnboardingCompleted(true));
                        redirectToApiClient(navigate);
                      }}
                      openWorkspace={openWorkspace}
                      isOpeningWorkspaceLoading={isOpeningWorkspaceLoading}
                    />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>
        <div
          className={clsx(
            "welcome-card-option onboarding-interceptor-card-option",
            isApiClientCardExpanded && "fade-out"
          )}
          onClick={() => {
            trackDesktopOnboardingFeatureSelected("rules");
            onFeatureClick(OnboardingStep.AUTH);
          }}
        >
          <WelcomeCardHeader
            title="Intercept and Modify Web Traffic"
            description="Capture and modify requests, responses, headers, and scripts in real time."
            iconSrc={"/assets/media/rules/rules-icon.svg"}
          />
          <MdOutlineKeyboardArrowRight className="api-client-onboard-card__arrow" />
        </div>
      </div>
      <div className="skip-footer">
        <Button type="link" size="small" loading={isLoading} onClick={createWorkspace}>
          Skip
        </Button>{" "}
        this screen and quick start
      </div>
    </div>
  );
};
