import React from "react";
import { Button } from "antd";
import RQOnlyLogo from "/assets/media/common/RQ-only-logo.svg";
import { WelcomeCardOption } from "../WelcomeCardOption/WelcomeCardOption";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { trackDesktopOnboardingFeatureSelected, trackDesktopOnboardingStepSkipped } from "../../analytics";
import { OnboardingStep } from "../../types";

interface Props {
  onFeatureClick: (step: OnboardingStep) => void;
}

export const WelcomeCard: React.FC<Props> = ({ onFeatureClick }) => {
  const dispatch = useDispatch();
  return (
    <>
      <img src={RQOnlyLogo} alt="RQ Only Logo" />
      <div className="rq-desktop-onboarding-modal-content__card-header" style={{ marginTop: "24px" }}>
        Welcome to the Requestly
      </div>
      <div className="rq-desktop-onboarding-modal-content__card-description">
        Intercept, Mock, Build & Test APIs faster
      </div>
      <div className="welcome-options">
        <WelcomeCardOption
          title="Start using API Client"
          description="Create, manage, and test APIs with collections and reusable variables."
          iconSrc={"/assets/media/apiClient/api-client-icon.svg"}
          onClick={() => {
            trackDesktopOnboardingFeatureSelected("api_client");
            onFeatureClick(OnboardingStep.FOLDER_SELECTION);
          }}
        />
        <WelcomeCardOption
          title="Intercept and Modify Web Traffic"
          description="Capture and modify requests, responses, headers, and scripts in real time."
          iconSrc={"/assets/media/rules/rules-icon.svg"}
          onClick={() => {
            trackDesktopOnboardingFeatureSelected("rules");
            onFeatureClick(OnboardingStep.AUTH);
          }}
        />
      </div>
      <div className="skip-footer">
        <Button
          type="link"
          size="small"
          onClick={() => {
            trackDesktopOnboardingStepSkipped(OnboardingStep.FEATURE_SELECTION);
            dispatch(globalActions.updateIsOnboardingCompleted(true));
          }}
        >
          Skip
        </Button>{" "}
        this screen and quick start
      </div>
    </>
  );
};
