import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import InviteView from "views/misc/Invite";

export const inviteRoutes: RouteObject[] = [
  {
    path: PATHS.INVITE.RELATIVE,
    element: <InviteView />,
  },
];
