import React from "react";
import { AuthForm } from "./components/Form";
import { OnboardingAuthBanner } from "./components/Banner";
import "./index.scss";

export const OnboardingAuthScreen: React.FC = () => {
  return (
    <div className="onboarding-auth-screen-wrapper">
      <div className="onboarding-auth-screen w-full">
        <div className="onboarding-auth-form-wrapper">
          <AuthForm />
        </div>
        <div className="onboarding-auth-banner-wrapper">
          <OnboardingAuthBanner />
        </div>
      </div>
    </div>
  );
};
