import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { EnvironmentView } from "./screens/environment/components/environmentView/EnvironmentView";
import { PostmanImporterView } from "./screens/PostmanImporterView/PostmanImporterView";
import { TabOutletHOC } from "layouts/TabsLayout/hoc/TabOutletHOC";
import { CollectionView } from "./screens/apiClient/components/clientView/components/Collection/CollectionView";
import { ApiClientEmptyView } from "./screens/apiClient/components/clientView/components/ApiClientEmptyView/ApiClientEmptyView";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceStoreContext } from "componentsV2/Tabs/store/tabServiceStore";

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
          // <TabOutletHOC>
          //   <ApiClientEmptyView />
          // </TabOutletHOC>
          // <TabServiceStoreContext.Provider >
          <TabsContainer />
          // </TabServiceProvider.Provider>
          //
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
        path: PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE + "/:envId",
        element: (
          <TabOutletHOC>
            <EnvironmentView />
          </TabOutletHOC>
        ),
        handle: {
          breadcrumb: {
            label: "Environments",
            isEditable: true,
          },
        },
      },
      {
        path: PATHS.API_CLIENT.ENVIRONMENTS.INDEX,
        element: <Navigate to={PATHS.API_CLIENT.RELATIVE} />,
      },
      {
        path: PATHS.API_CLIENT.IMPORT_FROM_POSTMAN.RELATIVE,
        element: <ProtectedRoute component={PostmanImporterView} />,
      },
    ],
  },
];
