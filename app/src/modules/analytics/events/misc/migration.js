import { trackEvent } from "modules/analytics";
import { HEADER_RULES_MIGRATED_TO_V2 } from "./constants";

export const trackHeaderRulesMigratedToV2 = () => {
  trackEvent(HEADER_RULES_MIGRATED_TO_V2);
};
