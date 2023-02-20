import { trackEvent } from "modules/analytics";
import { INSTALLATION } from "./constants";

export const trackDesktopAppInstalled = () => {
  trackEvent(INSTALLATION.DESKTOP_APP_INSTALLED);
};

export const trackExtensionInstalled = () => {
  trackEvent(INSTALLATION.EXTENSION_INSTALLED);
};
