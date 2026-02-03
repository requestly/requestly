import type { RouteObject } from "react-router-dom";

import { ApiClientLayout } from "@apiClientV2/modules/Layout";

export const apiClientRoutesV2: RouteObject[] = [
  {
    // Use relative path (without leading slash) because this is nested under /v2
    path: "api-client",
    element: <ApiClientLayout />,
    handle: {
      breadcrumb: {
        label: "API Client V2",
      },
    },
  },
];
