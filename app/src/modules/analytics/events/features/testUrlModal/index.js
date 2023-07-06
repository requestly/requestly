import { trackEvent } from "modules/analytics";
import { TEST_URL_CONDITION } from "../constants";

export const trackURLConditionModalViewed = (type, operator_type) => {
  const params = { type, operator_type };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MODAL_VIEWED, params);
};

export const trackURLConditionMatchingTried = (type, operator_type) => {
  const params = { type, operator_type };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MATCHING_TRIED, params);
};

export const trackURLConditionSourceModified = (type, operator_type) => {
  const params = { type, operator_type };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_SOURCE_MODIFIED, params);
};

export const trackURLConditionModalClosed = (type, operator_type) => {
  const params = { type, operator_type };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_MODAL_CLOSED, params);
};

export const trackURLConditionSourceModificationSaved = (type, operator_type) => {
  const params = { type, operator_type };
  trackEvent(TEST_URL_CONDITION.TEST_URL_CONDITION_SOURCE_MODIFICATION_SAVED, params);
};
