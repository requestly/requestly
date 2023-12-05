import React, { useState } from "react";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import { AUTH_MODE } from "features/onboarding/types";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AUTH_MODE>(AUTH_MODE.SIGNUP);

  return (
    <div className="onboarding-auth-screen-wrapper">
      <div className={`onboarding-auth-screen ${authMode === AUTH_MODE.SIGNUP ? "w-full" : ""}`}>
        <div className="onboarding-auth-form-wrapper">
          <AuthForm authMode={authMode} setAuthMode={setAuthMode} />
        </div>
        {authMode == AUTH_MODE.SIGNUP && (
          <div className="onboarding-auth-banner-wrapper">
            <OnboardingAuthBanner />
          </div>
        )}
      </div>
    </div>
  );
};
