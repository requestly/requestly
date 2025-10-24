import { trackEvent } from "modules/analytics";

export const EVENTS = {
  CONTACT_US_CLICKED: "contact_us_clicked",
};

export function trackContactUsClicked(source: string) {
  const params = { source };
  trackEvent(EVENTS.CONTACT_US_CLICKED, params);
}
