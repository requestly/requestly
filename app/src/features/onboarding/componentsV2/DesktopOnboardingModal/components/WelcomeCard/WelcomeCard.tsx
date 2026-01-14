import React, { useState } from "react";
import { Button } from "antd";
import RQOnlyLogo from "/assets/media/common/RQ-only-logo.svg";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { trackDesktopOnboardingFeatureSelected, trackDesktopOnboardingStepSkipped } from "../../analytics";
import { OnboardingStep } from "../../types";
import { WelcomeCardHeader } from "./components/WelcomeCardHeader/WelcomeCardHeader";
import { ApiClientOnboardCard } from "./components/ApiClientOnboardCard/ApiClientOnboardCard";
import clsx from "clsx";
import "./welcomeCard.scss";
import { useCreateDefaultLocalWorkspace } from "features/workspaces/hooks/useCreateDefaultLocalWorkspace";

interface Props {
  onFeatureClick: (step: OnboardingStep) => void;
}

export const WelcomeCard: React.FC<Props> = ({ onFeatureClick }) => {
  const dispatch = useDispatch();
  const [isApiClientCardExpanded, setIsApiClientCardExpanded] = useState(false);

  const { createWorkspace, isLoading } = useCreateDefaultLocalWorkspace({
    analyticEventSource: "desktop_onboarding",
    onCreateWorkspaceCallback: () => {
      trackDesktopOnboardingStepSkipped(OnboardingStep.FEATURE_SELECTION);
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    },
  });

  const handleApiClientCardExpandToggle = () => {
    setIsApiClientCardExpanded((prev) => !prev);
  };

  return (
    <>
      <img src={RQOnlyLogo} alt="RQ Only Logo" className={clsx(isApiClientCardExpanded && "fade-out")} />
      <div
        className={clsx("rq-desktop-onboarding-modal-content__card-header", isApiClientCardExpanded && "fade-out")}
        style={{ marginTop: "24px" }}
      >
        Welcome to the Requestly
      </div>
      <div
        className={clsx("rq-desktop-onboarding-modal-content__card-description", isApiClientCardExpanded && "fade-out")}
      >
        Intercept, Mock, Build & Test APIs faster
      </div>
      <div className="welcome-options">
        <ApiClientOnboardCard
          isExpanded={isApiClientCardExpanded}
          onExpandToggle={handleApiClientCardExpandToggle}
          onCreateWorkspaceClick={() => onFeatureClick(OnboardingStep.FOLDER_SELECTION)}
        />
        <div
          className={clsx("welcome-card-option", isApiClientCardExpanded && "fade-out")}
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
        </div>
      </div>
      <div className="skip-footer">
        <Button type="link" size="small" loading={isLoading} onClick={createWorkspace}>
          Skip
        </Button>{" "}
        this screen and quick start
      </div>
    </>
  );
};
