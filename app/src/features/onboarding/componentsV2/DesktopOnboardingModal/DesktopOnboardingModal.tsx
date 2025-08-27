import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { WorkspaceType } from "types";
import { WorkspaceCreationView } from "componentsV2/modals/CreateWorkspaceModal/components/WorkspaceCreationView";
import { AuthCard } from "./components/AuthCard/AuthCard";
import { WelcomeCard } from "./components/WelcomeCard/WelcomeCard";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./desktopOnboardingModal.scss";

export const DesktopOnboardingCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`rq-desktop-onboarding-modal-content__card ${className}`}>{children}</div>;
};

export enum OnboardingStep {
  WELCOME = "welcome",
  API_CLIENT = "api-client",
  AUTH = "auth",
}

export const DesktopOnboardingModal = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);

  useEffect(() => {
    if (user.loggedIn) {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    }
  }, [dispatch, user.loggedIn]);
  return (
    <Modal
      open={true}
      closable={false}
      footer={null}
      wrapClassName="rq-desktop-onboarding-modal-wrapper"
      className="rq-desktop-onboarding-modal"
    >
      <div className="rq-desktop-onboarding-modal-content">
        {onboardingStep === OnboardingStep.WELCOME ? (
          <DesktopOnboardingCard className="welcome-card">
            <WelcomeCard onFeatureClick={(step: OnboardingStep) => setOnboardingStep(step)} />
          </DesktopOnboardingCard>
        ) : onboardingStep === OnboardingStep.API_CLIENT ? (
          <DesktopOnboardingCard className="local-workspace-card">
            <WorkspaceCreationView
              workspaceType={WorkspaceType.LOCAL}
              onCancel={() => setOnboardingStep(OnboardingStep.WELCOME)}
              callback={() => dispatch(globalActions.updateIsOnboardingCompleted(true))}
            />
          </DesktopOnboardingCard>
        ) : onboardingStep === OnboardingStep.AUTH ? (
          <>
            <DesktopOnboardingCard className="auth-card">
              <AuthCard onBackClick={() => setOnboardingStep(OnboardingStep.WELCOME)} />
            </DesktopOnboardingCard>
            <Button
              type="link"
              className="skip-desktop-onboarding"
              onClick={() => dispatch(globalActions.updateIsOnboardingCompleted(true))}
            >
              Continue without sign in
            </Button>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
