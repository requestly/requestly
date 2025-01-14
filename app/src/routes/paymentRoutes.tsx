import PATHS from "config/constants/sub/paths";
import { UpgradeSuccess, UpgradeToAnnual } from "features/pricing";
import { RouteObject } from "react-router-dom";

export const paymentRoutes: RouteObject[] = [
  {
    path: PATHS.UPGRADE_SUCCESS.ABSOLUTE,
    element: <UpgradeSuccess />,
  },
  {
    path: PATHS.UPGRADE_TO_ANNUAL.ABSOLUTE,
    element: <UpgradeToAnnual />,
  },
];
