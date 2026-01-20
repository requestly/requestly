import { trackEvent } from "modules/analytics";
import { UNINSTALLATION } from "./constants";

export const trackExtensionUninstalled = () => {
  trackEvent(UNINSTALLATION.EXTENSION_UNINSTALLED);
};
