import React, { useMemo } from "react";
import { OnboardingSteps } from "../types";
import "./index.css";

interface Props {
  step: OnboardingSteps;
}

export const OnboardingBannerSteps: React.FC<Props> = ({ step }) => {
  const onboardingSteps = useMemo(() => {
    return {
      [OnboardingSteps.AUTH]: 0,
      [OnboardingSteps.PERSONA_SURVEY]: 1,
      [OnboardingSteps.CREATE_JOIN_WORKSPACE]: 2,
      [OnboardingSteps.RECOMMENDATIONS]: 3,
    };
  }, []);

  const currentStep = useMemo(() => onboardingSteps[step], [step, onboardingSteps]);

  return (
    <div className="onboarding-banner-steps-container">
      {Object.entries(onboardingSteps)
        .filter(([step, index]) => index !== 3)
        .map(([step, index]) => (
          <div
            key={index}
            className={`onboarding-banner-step-bar ${index <= currentStep && "onboarding-banner-step-bar-active"}`}
          ></div>
        ))}
    </div>
  );
};
