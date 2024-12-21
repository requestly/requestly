import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { EnvironmentView } from "./screens/environment/components/environmentView/EnvironmentView";
import { EnvironmentContainer } from "./screens/environment/container";
import { PostmanImporterView } from "./screens/PostmanImporterView/PostmanImporterView";
import { TabOutletHOC } from "layouts/TabsLayout/hoc/TabOutletHOC";
import { CollectionView } from "./screens/apiClient/components/clientView/components/Collection/CollectionView";
import { ApiClientEmptyView } from "./screens/apiClient/components/clientView/components/ApiClientEmptyView/ApiClientEmptyView";

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE,
    element: <ApiClientFeatureContainer />,
    handle: {
      breadcrumb: {
        label: "API Client",
      },
    },
    children: [
      {
        index: true,
        element: (
          <TabOutletHOC>
            <ApiClientEmptyView />
          </TabOutletHOC>
        ),
      },
      {
        path: PATHS.API_CLIENT.REQUEST.INDEX,
        element: (
          <TabOutletHOC>
            <ProtectedRoute component={APIClient} />
          </TabOutletHOC>
        ),
        handle: {
          breadcrumb: {
            label: "Request",
            isEditable: true,
          },
        },
      },
      {
        path: PATHS.API_CLIENT.COLLECTION.INDEX,
        element: (
          <TabOutletHOC>
            <ProtectedRoute component={CollectionView} />
          </TabOutletHOC>
        ),
        handle: {
          breadcrumb: {
            label: "Collection", // TODO: Fix, change it to collection, when collection view is added
            isEditable: true,
          },
        },
      },
      {
        path: PATHS.API_CLIENT.HISTORY.INDEX,
        element: (
          <TabOutletHOC>
            <APIClient />
          </TabOutletHOC>
        ),
        handle: {
          breadcrumb: {
            label: "History",
          },
        },
      },
      {
        path: PATHS.API_CLIENT.ENVIRONMENTS.INDEX,
        element: (
          <TabOutletHOC>
            <EnvironmentContainer />
          </TabOutletHOC>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={PATHS.API_CLIENT.RELATIVE} />,
          },
          {
            path: PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE + "/:envId",
            element: <EnvironmentView />,
            handle: {
              breadcrumb: {
                label: "Environments",
                isEditable: true,
              },
            },
          },
        ],
      },
      {
        path: PATHS.API_CLIENT.IMPORT_FROM_POSTMAN.RELATIVE,
        element: <ProtectedRoute component={PostmanImporterView} />,
      },
    ],
  },
];
