import { trackEvent } from "modules/analytics";
import { WINDOWS_AND_LINUX_BLOCKER_SCREEN } from "./constants";

export const trackBlockerScreenViewed = (featureName: string) => {
  const params = { featureName };
  trackEvent(WINDOWS_AND_LINUX_BLOCKER_SCREEN.VIEWED, params);
};

export const trackGithubIssueClicked = (featureName: string) => {
  const params = { featureName };
  trackEvent(WINDOWS_AND_LINUX_BLOCKER_SCREEN.GITHUB_ISSUE_CLICKED, params);
};

export const trackUseChromeExtensionClicked = (featureName: string) => {
  const params = { featureName };
  trackEvent(WINDOWS_AND_LINUX_BLOCKER_SCREEN.USE_CHROME_EXTENSION_CLICKED, params);
};
