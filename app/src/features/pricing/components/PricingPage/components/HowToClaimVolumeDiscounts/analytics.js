import { trackEvent } from "modules/analytics";

export const EVENTS = {
  CLAIM_VOLUME_DISCOUNTS_CTA_CLICKED: "claim_volume_discounts_cta_clicked",
};

export function trackClaimVolumeDiscountsCTAClicked() {
  trackEvent(EVENTS.CLAIM_VOLUME_DISCOUNTS_CTA_CLICKED);
}
