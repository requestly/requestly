import { trackEvent } from "modules/analytics";
import { EXECUTION_LOGS } from "../constants";

export const trackExecutionLogs = (rule_type) => {
  const params = {
    rule_type,
  };
  trackEvent(EXECUTION_LOGS.FETCHED, params);
};
