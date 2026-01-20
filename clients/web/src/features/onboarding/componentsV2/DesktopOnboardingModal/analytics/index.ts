import { trackEvent } from "modules/analytics";
import { DESKTOP_ONBOARDING } from "./constant";

export const trackDesktopOnboardingViewed = (step: string) => {
  trackEvent(DESKTOP_ONBOARDING.DESKTOP_ONBOARDING_VIEWED, { step });
};

export const trackDesktopOnboardingStepSkipped = (step: string) => {
  trackEvent(DESKTOP_ONBOARDING.DESKTOP_ONBOARDING_STEP_SKIPPED, { step });
};

export const trackDesktopOnboardingFeatureSelected = (feature: string) => {
  trackEvent(DESKTOP_ONBOARDING.DESKTOP_ONBOARDING_FEATURE_SELECTED, { feature });
};
