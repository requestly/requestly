import { trackEvent } from "modules/analytics";
import { ANNOUNCEMENTS, APP_ONBOARDING, PERSONA_SURVEY } from "./constants";

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

export const trackAppOnboardingIndustryUpdated = (industry: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_INDUSTRY_UPDATED, { industry });
};

export const trackAppOnboardingNameUpdated = () => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_NAME_UPDATED);
};

export const trackAppOnboardingManageWorkspaceClicked = () => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_MANAGE_WORKSPACE_CLICKED);
};

export const trackAppOnboardingTeamsViewed = (isWorkspaceAvailable: string) => {
  trackEvent(APP_ONBOARDING.APP_ONBOARDING_TEAMS_VIEWED, { isWorkspaceAvailable });
};

export const trackAcquisitionAnnouncementModalViewed = () => {
  trackEvent(ANNOUNCEMENTS.ACQUISITION_ANNOUNCEMENT_MODAL_VIEWED, {});
};

export const trackAcquisitionAnnouncementModalClosed = () => {
  trackEvent(ANNOUNCEMENTS.ACQUISITION_ANNOUNCEMENT_MODAL_CLOSED, {});
};

export const trackPersonaSurveyViewed = () => {
  trackEvent(PERSONA_SURVEY.VIEWED, {});
};

export const trackPersonaSurveyCompleted = (persona: string) => {
  trackEvent(PERSONA_SURVEY.COMPLETED, { persona });
};
