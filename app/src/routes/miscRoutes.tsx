import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import Updates from "views/features/Updates";
import Goodbye from "components/misc/Goodbye";
import ExtensionInstalled from "components/misc/ExtensionInstalled";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import Page403 from "views/misc/ServerResponses/403";
import Page404 from "views/misc/ServerResponses/404";
import AcceptTeamInvite from "components/user/Teams/AcceptTeamInvite";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import AppSumoModal from "components/landing/Appsumo/Appsumo";
import { ImportFromCharlesWrapperView } from "components/features/rules/ImportFromCharlesModal";
import { Home } from "components/Home";
import { PricingIndexPage } from "features/pricing/components/PricingPage";
import { IncentiveTasksListScreen } from "features/Incentives";

export const miscRoutes: RouteObject[] = [
  {
    path: PATHS.EXTENSION_INSTALLED.RELATIVE,
    element: <ExtensionInstalled />,
  },
  {
    path: PATHS.EXTENSION_UPDATED.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE + "?updatedToMv3"} />,
  },
  {
    path: PATHS.INSTALL_EXTENSION.RELATIVE,
    // @ts-ignore: takes few props
    element: <InstallExtensionCTA />,
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
    path: PATHS.IMPORT_FROM_CHARLES.RELATIVE,
    element: <ImportFromCharlesWrapperView />,
  },
  {
    path: PATHS.HOME.RELATIVE,
    element: <Home />,
  },
  {
    path: PATHS.APPSUMO.RELATIVE,
    element: <ProtectedRoute component={AppSumoModal} />,
  },
  {
    path: PATHS.CREDITS.RELATIVE,
    element: <IncentiveTasksListScreen />,
  },
  {
    path: PATHS.ANY,
    element: <Navigate to={PATHS.PAGE404.RELATIVE} />,
  },
];
