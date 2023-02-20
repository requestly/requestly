import { trackEvent } from "modules/analytics";
import { USERNAME } from "./constants";

export const trackUsernameUpdated = (username, old_username) => {
  const params = { username, old_username };
  trackEvent(USERNAME.USERNAME_UPDATED, params);
};
