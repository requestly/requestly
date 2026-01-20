import { trackEvent } from "modules/analytics";
import { RULE_SIMULATOR } from "../constants";

export const trackSimulateRulesEvent = (rule_type) => {
  const params = {
    rule_type,
  };
  trackEvent(RULE_SIMULATOR.SIMULATED, params);
};
