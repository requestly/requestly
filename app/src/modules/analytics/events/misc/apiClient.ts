import { trackEvent } from "modules/analytics";

export const trackTabReordered = (newOrder: number[]) => {
  trackEvent("api_client_tab_reordered", { order: newOrder });
};
