import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import AppModeView from "views/misc/AppMode";
import FeedbackView from "views/misc/Feedback";
import Updates from "views/features/Updates";
import Pricing from "views/landing/Pricing";
import ManageLicense from "views/user/ManageLicense";
import Goodbye from "components/misc/Goodbye";
import ExtensionInstalled from "components/misc/ExtensionInstalled";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import Page403 from "views/misc/ServerResponses/403";
import Page404 from "views/misc/ServerResponses/404";
import AcceptTeamInviteView from "views/user/Teams/AcceptInvite";

export const onboardingRoutes: RouteObject[] = [
  {
    path: PATHS.EXTENSION_INSTALLED.RELATIVE,
    element: <ExtensionInstalled />,
  },
  {
    path: PATHS.INSTALL_EXTENSION.RELATIVE,
    // @ts-ignore: takes few props
    element: <InstallExtensionCTA />,
  },
  {
    path: PATHS.APP_MODE.RELATIVE,
    element: <AppModeView />,
  },
  {
    path: PATHS.FEEDBACK.RELATIVE,
    element: <FeedbackView />,
  },
  {
    path: PATHS.UPDATES.RELATIVE,
    element: <Updates />,
  },
  {
    path: PATHS.PRICING.RELATIVE,
    element: <Pricing />,
  },
  {
    path: PATHS.LICENSE.MANAGE.RELATIVE,
    element: <ManageLicense />,
  },
  {
    path: PATHS.GOODBYE.RELATIVE,
    element: <Goodbye />,
  },
  {
    path: PATHS.PAGE403.RELATIVE,
    element: <Page403 />,
  },
  {
    path: PATHS.PAGE404.RELATIVE,
    element: <Page404 />,
  },
  {
    path: PATHS.ACCEPT_TEAM_INVITE.RELATIVE,
    element: <AcceptTeamInviteView />,
  },
];
