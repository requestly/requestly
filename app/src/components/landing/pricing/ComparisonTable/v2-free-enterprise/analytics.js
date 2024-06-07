import { trackEvent } from "modules/analytics";

export const EVENTS = {
  ENTERPRISE_PLAN_SCHEDULE_MEET_BUTTON_CLICKED: "enterprise_plan_schedule_meet_button_clicked",
};

export function trackEnterprisePlanScheduleMeetButtonClicked() {
  trackEvent(EVENTS.ENTERPRISE_PLAN_SCHEDULE_MEET_BUTTON_CLICKED);
}
