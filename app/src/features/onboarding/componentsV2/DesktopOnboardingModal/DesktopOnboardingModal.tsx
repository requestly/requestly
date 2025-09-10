import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { WorkspaceCreationView } from "componentsV2/modals/CreateWorkspaceModal/components/WorkspaceCreationView";
import { AuthCard } from "./components/AuthCard/AuthCard";
import { WelcomeCard } from "./components/WelcomeCard/WelcomeCard";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { IoMdArrowBack } from "@react-icons/all-files/io/IoMdArrowBack";
import { trackDesktopOnboardingStepSkipped, trackDesktopOnboardingViewed } from "./analytics";
import { OnboardingStep } from "./types";
import { WorkspaceType } from "features/workspaces/types";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import "./desktopOnboardingModal.scss";

export const DesktopOnboardingCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`rq-desktop-onboarding-modal-content__card ${className}`}>{children}</div>;
};

export const DesktopOnboardingModal = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(OnboardingStep.FEATURE_SELECTION);

  const isLocalSyncSupported = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  useEffect(() => {
    if (user.loggedIn || !isLocalSyncSupported) {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    }
  }, [dispatch, user.loggedIn, isLocalSyncSupported]);

  useEffect(() => {
    trackDesktopOnboardingViewed(onboardingStep);
  }, [onboardingStep]);

  if (!isLocalSyncSupported) {
    return null;
  }

  return (
    <Modal
      open={true}
      closable={false}
      footer={null}
      wrapClassName="rq-desktop-onboarding-modal-wrapper"
      className="rq-desktop-onboarding-modal"
    >
      <div className="rq-desktop-onboarding-modal-content">
        {onboardingStep === OnboardingStep.FEATURE_SELECTION ? (
          <DesktopOnboardingCard className="welcome-card">
            <WelcomeCard onFeatureClick={(step: OnboardingStep) => setOnboardingStep(step)} />
          </DesktopOnboardingCard>
        ) : onboardingStep === OnboardingStep.FOLDER_SELECTION ? (
          <DesktopOnboardingCard className="local-workspace-card">
            <div className="rq-desktop-onboarding-modal-content__local-workspace-card-header">
              <IoMdArrowBack onClick={() => setOnboardingStep(OnboardingStep.FEATURE_SELECTION)} /> Create a new local
              workspace
            </div>
            <WorkspaceCreationView
              workspaceType={WorkspaceType.LOCAL}
              onCancel={() => setOnboardingStep(OnboardingStep.FEATURE_SELECTION)}
              callback={() => dispatch(globalActions.updateIsOnboardingCompleted(true))}
              analyticEventSource="desktop_onboarding_modal"
            />
          </DesktopOnboardingCard>
        ) : onboardingStep === OnboardingStep.AUTH ? (
          <>
            <DesktopOnboardingCard className="auth-card">
              <AuthCard onBackClick={() => setOnboardingStep(OnboardingStep.FEATURE_SELECTION)} />
            </DesktopOnboardingCard>
            <Button
              type="link"
              className="skip-desktop-onboarding"
              onClick={() => {
                trackDesktopOnboardingStepSkipped(OnboardingStep.AUTH);
                dispatch(globalActions.updateIsOnboardingCompleted(true));
              }}
            >
              Continue without sign in
            </Button>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
