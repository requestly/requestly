import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import RuleSelection from "views/landing/RuleSelection";
import GettingStarted from "components/features/rules/GettingStarted";
import InviteView from "views/misc/Invite";

export const onboardingRoutes: RouteObject[] = [
  {
    path: PATHS.ONBOARDING.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.RULES.CREATE,
    element: <RuleSelection />,
  },
  {
    path: PATHS.GETTING_STARTED,
    element: <GettingStarted />,
  },
  {
    path: PATHS.INVITE.RELATIVE,
    element: <InviteView />,
  },
];
