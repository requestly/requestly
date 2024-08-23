import PATHS from "config/constants/sub/paths";
import { UpgradeSuccess } from "features/pricing";
import { RouteObject } from "react-router-dom";

export const paymentRoutes: RouteObject[] = [
  {
    path: PATHS.UPGRADE_SUCCESS.ABSOLUTE,
    element: <UpgradeSuccess />,
  },
];
