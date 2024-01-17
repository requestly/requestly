import { trackEvent } from "modules/analytics";
import { CONTACT_US_MODAL } from "./constants";

export const trackContactUsModalViewed = (source: string) => {
  trackEvent(CONTACT_US_MODAL.MODAL_VIEWED, { source });
};

export const trackContactUsModalMeetScheduled = (source: string) => {
  trackEvent(CONTACT_US_MODAL.MEET_SCHEDULED, { source });
};
