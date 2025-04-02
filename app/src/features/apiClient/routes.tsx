import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { ApiClientEmptyView } from "./screens/apiClient/components/clientView/components/ApiClientEmptyView/ApiClientEmptyView";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { PostmanImporterView } from "./screens/PostmanImporterView/PostmanImporterView";

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE + "/*",
    element: <ApiClientFeatureContainer />,
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
