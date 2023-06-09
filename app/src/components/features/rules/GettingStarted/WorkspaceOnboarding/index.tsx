import React, { useCallback, useState, useMemo } from "react";
import { FullPageHeader } from "components/common/FullPageHeader";
import { AuthFormHero } from "components/authentication/AuthForm/AuthFormHero";
import { OnboardingAuthForm } from "./OnboardingSteps/OnboardingAuthForm";
import { GettingStartedWithSurvey } from "components/features/rules/GettingStarted/WorkspaceOnboarding/OnboardingSteps/PersonaSurvey/GettingStartedWithSurvey";
import { OnboardingSteps } from "./types";

import "./index.css";
export const WorkspaceOnboarding: React.FC = () => {
  const [step, setStep] = useState<OnboardingSteps>(OnboardingSteps.AUTH);
  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);

  const renderOnboardingBanner = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return <AuthFormHero currentTestimonialIndex={currentTestimonialIndex} />;
      case OnboardingSteps.PERSONA_SURVEY:
        return <GettingStartedWithSurvey />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <>CREATE OR JOIN WORKSPACE BANNER HERE</>;
    }
  }, [step, currentTestimonialIndex]);

  const renderOnboardingActionComponent = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return <OnboardingAuthForm callback={{ onSignInSuccess: () => setStep(OnboardingSteps.PERSONA_SURVEY) }} />;
      case OnboardingSteps.PERSONA_SURVEY:
        return <>PERSONA SURVEY WILL COME HERE</>;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <>CREATE OR JOIN WORKSPACE ACTIONS Here</>;
    }
  }, [step]);
  return (
    <>
      <FullPageHeader />
      <div className="onboarding-content-wrapper">
        <div className={`onboarding-content-banner ${step === OnboardingSteps.PERSONA_SURVEY && "flex-start"}`}>
          {renderOnboardingBanner()}
        </div>
        <div className="onboarding-action-component">{renderOnboardingActionComponent()}</div>
      </div>
    </>
  );
};
