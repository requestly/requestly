import type { RouteObject } from "react-router-dom";

import { HelloWorld } from "@apiClientV2/common/HelloWorld";

export const apiClientRoutesV2: RouteObject[] = [
  {
    // Use relative path (without leading slash) because this is nested under /v2
    path: "api-client",
    element: <HelloWorld />,
    handle: {
      breadcrumb: {
        label: "API Client V2",
      },
    },
  },
];
