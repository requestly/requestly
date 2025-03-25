import React from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import PATHS from "config/constants/sub/paths";
import { APIClient } from "features/apiClient/screens/apiClient/APIClient";
import { ApiClientEmptyView } from "features/apiClient/screens/apiClient/components/clientView/components/ApiClientEmptyView/ApiClientEmptyView";
import { CollectionView } from "features/apiClient/screens/apiClient/components/clientView/components/Collection/CollectionView";
import { EnvironmentView } from "features/apiClient/screens/environment/components/environmentView/EnvironmentView";
import { PostmanImporterView } from "features/apiClient/screens/PostmanImporterView/PostmanImporterView";

// TODO: handle 404 route
export const tabRoutes: {
  path: string;
  element: React.ReactNode;
}[] = [
  {
    path: PATHS.API_CLIENT.INDEX,
    element: <ApiClientEmptyView />,
  },
  {
    path: PATHS.API_CLIENT.REQUEST.ABSOLUTE,
    element: <ProtectedRoute component={APIClient} />,
  },
  {
    path: PATHS.API_CLIENT.COLLECTION.ABSOLUTE,
    element: <ProtectedRoute component={CollectionView} />,
  },
  {
    path: PATHS.API_CLIENT.HISTORY.ABSOLUTE,
    element: <APIClient />,
  },
  {
    path: PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE + "/:envId",
    element: <EnvironmentView />,
  },
  {
    path: PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE,
    element: <Navigate to={PATHS.API_CLIENT.RELATIVE} />,
  },
  {
    path: PATHS.API_CLIENT.IMPORT_FROM_POSTMAN.ABSOLUTE,
    element: <ProtectedRoute component={PostmanImporterView} />,
  },
];
