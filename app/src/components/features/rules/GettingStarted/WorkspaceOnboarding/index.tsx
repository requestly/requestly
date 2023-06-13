import React, { useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { FullPageHeader } from "components/common/FullPageHeader";
import { AuthFormHero } from "components/authentication/AuthForm/AuthFormHero";
import { OnboardingAuthForm } from "./OnboardingSteps/OnboardingAuthForm";
import { GettingStartedWithSurvey } from "components/features/rules/GettingStarted/WorkspaceOnboarding/OnboardingSteps/PersonaSurvey/GettingStartedWithSurvey";
import { PersonaSurvey } from "./OnboardingSteps/PersonaSurvey";
import { isEmailVerified } from "utils/AuthUtils";
import { OnboardingSteps } from "./types";
import "./index.css";
import PersonaRecommendation from "../PersonaRecommendation";
import { WorkspaceOnboardingBanner } from "./OnboardingSteps/TeamWorkspaces/Banner";
import { WorkspaceOnboardingStep } from "./OnboardingSteps/TeamWorkspaces";

interface OnboardingProps {
  handleUploadRulesModalClick: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ handleUploadRulesModalClick }) => {
  const [step, setStep] = useState<OnboardingSteps>(OnboardingSteps.AUTH);
  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const user = useSelector(getUserAuthDetails);

  const handleOnSurveyCompletion = async () => {
    //@ts-ignore
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      console.log({ result });
      if (result) setStep(OnboardingSteps.CREATE_JOIN_WORKSPACE);
      else setStep(OnboardingSteps.RECOMMENDATIONS);
    });
  };

  const renderOnboardingBanner = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return <AuthFormHero currentTestimonialIndex={currentTestimonialIndex} />;
      case OnboardingSteps.PERSONA_SURVEY:
        return <GettingStartedWithSurvey />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <WorkspaceOnboardingBanner />;
    }
  }, [step, currentTestimonialIndex]);

  const renderOnboardingActionComponent = useCallback(() => {
    switch (step) {
      case OnboardingSteps.AUTH:
        return <OnboardingAuthForm callback={{ onSignInSuccess: () => setStep(OnboardingSteps.PERSONA_SURVEY) }} />;
      case OnboardingSteps.PERSONA_SURVEY:
        return <PersonaSurvey callback={handleOnSurveyCompletion} />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <WorkspaceOnboardingStep />;
    }
  }, [step]);
  return (
    <>
      {step === OnboardingSteps.RECOMMENDATIONS ? (
        <PersonaRecommendation isUserLoggedIn={user?.loggedIn} handleUploadRulesClick={handleUploadRulesModalClick} />
      ) : (
        <>
          <FullPageHeader />
          <div className="onboarding-content-wrapper">
            <div className="onboarding-content-banner">{renderOnboardingBanner()}</div>
            <div className="onboarding-action-component">{renderOnboardingActionComponent()}</div>
          </div>
        </>
      )}
    </>
  );
};
