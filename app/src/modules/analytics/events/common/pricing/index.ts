import { trackEvent } from "modules/analytics";
import { PRICING } from "../constants";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { RuleType } from "types";

type ViewPricingPlansClickSource = "crown" | "my_profile" | "feature_limiter_banner" | "workspace_upgrade";

export const trackViewPricingPlansClicked = (source: ViewPricingPlansClickSource) => {
  const params = { source };
  trackEvent(PRICING.VIEW_PRICING_PLANS_CLICKED, params);
};

export type FeatureType = Lowercase<keyof typeof FeatureLimitType>;

export type PaidFeatureNudgeViewedSource =
  | "rule_dropdown"
  | "rule_selection_screen"
  | "share_button"
  | "share_modal"
  | Lowercase<keyof typeof RuleType>;

export const trackPaidFeatureNudgeViewed = (featureType: FeatureType, source?: PaidFeatureNudgeViewedSource) => {
  const params = { featureType, source };
  trackEvent(PRICING.PAID_FEATURE_NUDGE_VIEWED, params);
};
