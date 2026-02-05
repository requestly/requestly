import type { RouteObject } from "react-router-dom";
import { ApiClientEmptyView } from "features/apiClient/screens/apiClient/components/views/components/ApiClientEmptyView/ApiClientEmptyView";

import { APIClientRouteElement } from "@apiClientV2/modules/Layout";

export const apiClientRoutesV2: RouteObject[] = [
  {
    // Use relative path (without leading slash) because this is nested under /v2
    path: "api-client/*",
    element: <APIClientRouteElement />,
    handle: {
      breadcrumb: {
        label: "API Client V2",
      },
    },
    children: [
      {
        index: true,
        element: <ApiClientEmptyView />,
      },
    ],
  },
];
