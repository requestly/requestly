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

interface OnboardingProps {
  handleUploadRulesModalClick: () => void;
}

export const WorkspaceOnboarding: React.FC<OnboardingProps> = ({ handleUploadRulesModalClick }) => {
  const [step, setStep] = useState<OnboardingSteps>(OnboardingSteps.AUTH);
  const currentTestimonialIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const user = useSelector(getUserAuthDetails);

  const handleOnSurveyCompletion = async () => {
    const isVerified = await isEmailVerified(user?.details?.profile?.uid);
    console.log({ isVerified });
    if (isVerified) setStep(OnboardingSteps.CREATE_JOIN_WORKSPACE);
    //TODO: fix this
    else setStep(OnboardingSteps.RECOMMENDATIONS);
  };

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
        return <PersonaSurvey callback={handleOnSurveyCompletion} />;
      case OnboardingSteps.CREATE_JOIN_WORKSPACE:
        return <>CREATE OR JOIN WORKSPACE ACTIONS Here</>;
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
            <div className={`onboarding-content-banner ${step === OnboardingSteps.PERSONA_SURVEY && "flex-start"}`}>
              {renderOnboardingBanner()}
            </div>
            <div className="onboarding-action-component">{renderOnboardingActionComponent()}</div>
          </div>
        </>
      )}
    </>
  );
};
