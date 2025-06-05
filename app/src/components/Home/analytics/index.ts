import { trackEvent } from "modules/analytics";
import { HOMEPAGE } from "./constants";

export const trackHomeRulesActionClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_RULES_ACTION_CLICKED, { action });
};

export const trackHomeMockingActionClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_MOCKING_ACTION_CLICKED, { action });
};

export const trackHomeApisActionClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_API_ACTION_CLICKED, { action });
};

export const trackHomeWorkspaceActionClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_WORKSPACE_ACTION_CLICKED, { action });
};

export const trackHomeMockActionClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_MOCK_ACTION_CLICKED, { action });
};

export const trackHomeTemplatePreviewClicked = (template: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_TEMPATE_PREVIEW_CLICKED, { template });
};

export const trackHomeViewAllTemplatesClicked = () => {
  trackEvent(HOMEPAGE.HOME_SCREEN_VIEW_ALL_TEMPLATES_CLICKED);
};

export const trackHomeHelpClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_HELP_CLICKED, { action });
};

export const trackHomeWhatsNewClicked = (action: string) => {
  trackEvent(HOMEPAGE.HOME_SCREEN_WHATS_NEW_CLICKED, { action });
};

export const trackHomeChangeLogNotLoaded = () => {
  trackEvent(HOMEPAGE.HOME_SCREEN_CHANGE_LOG_NOT_LOADED);
};

export const trackTemplatesScrolled = () => {
  trackEvent(HOMEPAGE.HOME_SCREEN_TEMPLATES_SCROLLED);
};
