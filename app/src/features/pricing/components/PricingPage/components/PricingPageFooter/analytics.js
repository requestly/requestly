import { trackEvent } from "modules/analytics";

export const EVENTS = {
  REQUEST_DOCUEMNT_CLICKED: "request_document_clicked",
  ADD_TO_CHROME_CLICK: "add_to_chrome_click",
};

export function trackRequestDocumentClicked() {
  trackEvent(EVENTS.REQUEST_DOCUEMNT_CLICKED);
}

export function trackAddToChromeClicked(source) {
  const params = { source };
  trackEvent(EVENTS.ADD_TO_CHROME_CLICK, params);
}
