import { trackEvent } from "modules/analytics";

export const EVENTS = {
  REQUEST_DOCUEMNT_FORM_SUBMMITTED: "request_documents_form_submitted",
};

export function trackRequestDocumentClicked() {
  trackEvent(EVENTS.REQUEST_DOCUEMNT_FORM_SUBMMITTED);
}
