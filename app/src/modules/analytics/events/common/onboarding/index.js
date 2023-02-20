import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export const trackExtensionInstallationButtonClicked = (eventPage) => {
  const params = { eventPage };
  trackEvent(ONBOARDING.INSTALL_EXTENSION_LINK_CLICKED, params);
};
