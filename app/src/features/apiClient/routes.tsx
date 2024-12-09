import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { EnvironmentView } from "./screens/environment/components/environmentView/EnvironmentView";
import { EmptyEnvironmentView } from "./screens/environment/components/emptyEnvironmentView/EmptyEnvironmentView";
import { EnvironmentContainer } from "./screens/environment/container";
import { PostmanImporterView } from "./screens/PostmanImporterView/PostmanImporterView";
import { TabOutletHOC } from "layouts/TabsLayout/hoc/TabOutletHOC";
import { APIClientEmptyView } from "./screens/apiClient/components/sidebar/components/APIClientEmptyView/APIClientEmptyView";

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
            <APIClientEmptyView />
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
            <ProtectedRoute component={APIClient} />
          </TabOutletHOC>
        ),
        handle: {
          breadcrumb: {
            label: "Request", // TODO: Fix, change it to collection, when collection view is added
            isEditable: false,
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
            element: <EmptyEnvironmentView />,
          },
          {
            path: PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE + "/:envId",
            element: <EnvironmentView />,
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
