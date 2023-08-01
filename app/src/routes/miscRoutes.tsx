import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import AppMode from "components/misc/AppMode";
import Updates from "views/features/Updates";
import PricingIndexPage from "components/landing/pricing/PricingIndexPage";
import Goodbye from "components/misc/Goodbye";
import ExtensionInstalled from "components/misc/ExtensionInstalled";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import Page403 from "views/misc/ServerResponses/403";
import Page404 from "views/misc/ServerResponses/404";
import AcceptTeamInvite from "components/user/Teams/AcceptTeamInvite";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { Home } from "components/landing/Home";

export const miscRoutes: RouteObject[] = [
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
    element: <AppMode />,
  },
  {
    path: PATHS.UPDATES.RELATIVE,
    element: <Updates />,
  },
  {
    path: PATHS.PRICING.RELATIVE,
    element: <PricingIndexPage />,
  },
  {
    path: PATHS.GOODBYE.RELATIVE,
    element: <Goodbye />,
  },
  {
    path: PATHS.LEGACY.GOODBYE.ABSOLUTE,
    element: <Navigate to={PATHS.GOODBYE.RELATIVE} />,
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
    element: <ProtectedRoute component={AcceptTeamInvite} />,
  },
  {
    path: PATHS.HOME.RELATIVE,
    element: <Home />,
  },
  {
    path: PATHS.ANY,
    element: <Navigate to={PATHS.PAGE404.RELATIVE} />,
  },
];
