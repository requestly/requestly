import { trackEvent } from "modules/analytics";
import { TEST_URL_CONDITION } from "../constants";

export const trackURLConditionModalViewed = (operator_type, kwargs) => {
  const params = { operator_type, ...kwargs };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MODAL_VIEWED, params);
};

export const trackURLConditionMatchingTried = (operator_type, kwargs) => {
  const params = { operator_type, ...kwargs };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MATCHING_TRIED, params);
};

export const trackURLConditionSourceModified = (operator_type, kwargs) => {
  const params = { operator_type, ...kwargs };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_SOURCE_MODIFIED, params);
};

export const trackURLConditionModalClosed = (operator_type, kwargs) => {
  const params = { operator_type, ...kwargs };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MODAL_CLOSED, params);
};

export const trackURLConditionSourceModificationSaved = (operator_type, kwargs) => {
  const params = { operator_type, ...kwargs };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_SOURCE_MODIFICATION_SAVED, params);
};

export const trackURLConditionAnimationViewed = () => {
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_ANIMATION_VIEWED);
};
