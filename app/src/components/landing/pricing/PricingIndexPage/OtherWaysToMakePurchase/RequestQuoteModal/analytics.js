import { trackEvent } from "modules/analytics";

export const EVENTS = {
  REQUEST_QUOTE_FORM_SUBMITTED: "request_quote_form_submitted",
};

export function trackRequestQuoteFormSubmitted() {
  trackEvent(EVENTS.REQUEST_QUOTE_FORM_SUBMITTED);
}
