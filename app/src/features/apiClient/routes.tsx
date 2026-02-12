import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

// Lazy-loaded components for better code splitting
const ApiClientEmptyView = lazy(() =>
  import("./screens/apiClient/components/views/components/ApiClientEmptyView/ApiClientEmptyView").then((m) => ({
    default: m.ApiClientEmptyView,
  }))
);
const ProtectedRoute = lazy(() => import("components/authentication/ProtectedRoute"));
const PostmanImporterView = lazy(() =>
  import("./screens/PostmanImporterView/PostmanImporterView").then((m) => ({ default: m.PostmanImporterView }))
);
const ApiClientRouteElement = lazy(() =>
  import("./components/RouteElement").then((m) => ({ default: m.ApiClientRouteElement }))
);

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE + "/*",
    element: <ApiClientRouteElement />,
    handle: {
      breadcrumb: {
        label: "API Client",
      },
    },
    children: [
      {
        index: true,
        element: <ApiClientEmptyView />,
      },
    ],
  },
  {
    path: PATHS.API_CLIENT.IMPORT_FROM_POSTMAN.ABSOLUTE,
    element: <ProtectedRoute component={PostmanImporterView} />,
  },
];
