import type { RouteObject } from "react-router-dom";

import { apiClientRoutesV2 } from "@v2features/apiClient";

/**
 * V2 Routes - All routes under /v2/* will use components from srcv2
 * This allows gradual migration from src to srcv2 by feature
 */
export const routesV2Src: RouteObject[] = [
  {
    path: "",
    children: [
      ...apiClientRoutesV2,
      // Add more v2 feature routes here as they're migrated
    ],
  },
];
