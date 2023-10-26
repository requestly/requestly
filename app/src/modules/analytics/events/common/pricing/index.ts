import { trackEvent } from "modules/analytics";
import { PRICING } from "../constants";

type ViewPricingPlansClickSource = "crown" | "my_profile" | "feature_limiter_banner" | "workspace_upgrade";

export const trackViewPricingPlansClicked = (source: ViewPricingPlansClickSource) => {
  const params = { source };
  trackEvent(PRICING.VIEW_PRICING_PLANS_CLICKED, params);
};
