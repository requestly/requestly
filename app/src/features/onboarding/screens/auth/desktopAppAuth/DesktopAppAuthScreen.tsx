import React, { useCallback } from "react";
import AuthModalHeader from "features/onboarding/components/OnboardingHeader/OnboardingHeader";
import { OnboardingCard } from "features/onboarding/componentsV2/OnboardingCard/OnboardingCard";
import { AuthInProgressCard } from "./components/AuthInProgress/AuthInProgressCard";
import { useAuthScreenContext } from "../context";
import "./desktopAppAuthScreen.scss";

export const DesktopAppAuthScreen: React.FC = () => {
  const { authMode, eventSource, toggleAuthModal } = useAuthScreenContext();

  const onGoBackClick = useCallback(() => {
    toggleAuthModal(false);
  }, [toggleAuthModal]);

  return (
    <div className="desktop-app-auth-screen-container">
      <div className="desktop-app-auth-screen-content">
        <AuthModalHeader onHeaderButtonClick={onGoBackClick} />
        <OnboardingCard>
          <AuthInProgressCard eventSource={eventSource} authMode={authMode} onGoBackClick={onGoBackClick} />
        </OnboardingCard>
      </div>
    </div>
  );
};
