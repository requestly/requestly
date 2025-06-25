import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { PricingIndexPage } from "./components/PricingPage";

export const pricingRoutes: RouteObject[] = [
  {
    path: PATHS.PRICING.RELATIVE,
    element: <PricingIndexPage />,
  },
];
