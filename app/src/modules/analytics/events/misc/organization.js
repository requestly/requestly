import { trackEvent } from "modules/analytics";
import { ORGANIZATION } from "./constants";

export const trackViewMoreUsersClicked = () => {
  trackEvent(ORGANIZATION.VIEW_MORE_USERS_CLICKED, {});
};

export const trackMyOrgPageViewed = () => {
  trackEvent(ORGANIZATION.PAGE_VIEWED, {});
};

export const trackCreateTeamSubsClickedOnOrgsPage = () => {
  trackEvent(ORGANIZATION.CREATE_TEAM_SUBSCRIPTION_CLICKED, {});
};
