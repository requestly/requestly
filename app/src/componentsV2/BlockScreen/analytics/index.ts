import { trackEvent } from "modules/analytics";

export const trackBlockScreenViewed = (blockType: string) => {
  trackEvent("block_screen_viewed", {
    blockType,
  });
};
