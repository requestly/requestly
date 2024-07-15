import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import InviteView from "views/misc/Invite";

export const onboardingRoutes: RouteObject[] = [
  {
    path: PATHS.ONBOARDING.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.INVITE.RELATIVE,
    element: <InviteView />,
  },
];
