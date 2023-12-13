import { trackEvent } from "modules/analytics";
import { APP_ONBOARDING } from "./constants";

export const trackAppOnboardingViewed = (step: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_VIEWED, { step });
};

export const trackAppOnboardingStepCompleted = (step: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_STEP_COMPLETED, { step });
};

export const trackAppOnboardingSkipped = (step: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_SKIPPED, { step });
};

export const trackAppOnboardingRecommendationSelected = (feature: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_RECOMMENDATION_SELECTED, { feature });
};

export const trackAppOnboardingPersonaUpdated = (persona: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_PERSONA_UPDATED, { persona });
};

export const trackAppOnboardingNameUpdated = () => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_NAME_UPDATED);
};

export const trackAppOnboardingManageWorkspaceClicked = () => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_MANAGE_WORKSPACE_CLICKED);
};

export const trackAppOnboardingGettingStartedViewed = (isWorkspaceAvailable: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_GETTING_STARTED_VIEWED, { isWorkspaceAvailable });
};
