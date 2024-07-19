import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import InviteView from "views/misc/Invite";

export const onboardingRoutes: RouteObject[] = [
  {
    path: PATHS.ONBOARDING.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.RULES.CREATE + "*",
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} state={{ from: PATHS.RULES.CREATE }} />,
  },
  {
    path: PATHS.GETTING_STARTED,
    element: <Navigate to={PATHS.HOME.ABSOLUTE} state={{ from: PATHS.GETTING_STARTED }} />,
  },
  {
    path: PATHS.INVITE.RELATIVE,
    element: <InviteView />,
  },
];
