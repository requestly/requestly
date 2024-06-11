import { trackEvent } from "modules/analytics";

export const EVENTS = {
  REQUEST_DOCUEMNT_CLICKED: "request_document_clicked",
};

export function trackRequestDocumentClicked() {
  trackEvent(EVENTS.REQUEST_DOCUEMNT_CLICKED);
}
