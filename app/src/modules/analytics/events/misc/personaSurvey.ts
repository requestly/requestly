import { PERSONA_SURVEY } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackPersonaSurveyViewed = () => {
  trackEvent(PERSONA_SURVEY.PERSONA_SURVEY_VIEWED);
};

export const trackPersonaQ1Completed = (option: string) => {
  const params = { option };
  trackEvent(PERSONA_SURVEY.PERSONA_Q1_COMPLETED, params);
};

export const trackPersonaQ2Completed = (option: string[]) => {
  const params = { option };
  trackEvent(PERSONA_SURVEY.PERSONA_Q2_COMPLETED, params);
};

export const trackPersonaQ3Completed = (options: string) => {
  const params = { options };
  trackEvent(PERSONA_SURVEY.PERSONA_Q3_COMPLETED, params);
};

export const trackPersonaRecommendationSelected = (feature: string) => {
  const params = { feature };
  trackEvent(PERSONA_SURVEY.PERSONA_RECOMMENDATION_SELECTED, params);
};

export const trackPersonaRecommendationSkipped = () => {
  trackEvent(PERSONA_SURVEY.PERSONA_RECOMMENDATION_SKIPPED);
};
