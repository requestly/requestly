import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { joinPaths } from "utils/PathUtils";
import { MockType } from "components/features/mocksV2/types";

// Lazy-loaded components for better code splitting
const FileMockEditorCreateView = lazy(() => import("views/features/mocksV2/FileMockEditorCreateView"));
const ProtectedRoute = lazy(() => import("components/authentication/ProtectedRoute"));
const MockEditorIndex = lazy(() => import("components/features/mocksV2/MockEditorIndex"));
const MocksFeatureContainer = lazy(() => import("./container"));
const MocksListScreen = lazy(() => import("./screens/mocksList").then((m) => ({ default: m.MocksListScreen })));

export const mockServerRoutes: RouteObject[] = [
  {
    path: PATHS.MOCK_SERVER.INDEX,
    element: <MocksFeatureContainer />,
    handle: {
      breadcrumb: {
        label: "File server",
        navigateTo: PATHS.MOCK_SERVER.INDEX,
      },
    },
    children: [
      //  MOCKS V2
      {
        index: true,
        element: <Navigate to={PATHS.MOCK_SERVER_V2.RELATIVE} />,
        handle: {
          breadcrumb: {
            label: "JSON file",
            navigateTo: PATHS.MOCK_SERVER_V2.RELATIVE,
          },
        },
      },
      {
        path: PATHS.MOCK_SERVER_V2.RELATIVE,
        element: <MocksListScreen type={MockType.API} />,
        handle: {
          breadcrumb: {
            label: "All",
            navigateTo: PATHS.MOCK_SERVER_V2.RELATIVE,
          },
        },
      },
      {
        path: PATHS.MOCK_SERVER_V2.CREATE.RELATIVE,
        element: <ProtectedRoute component={MockEditorIndex} isNew={true} mockType={MockType.API} />,
        handle: {
          breadcrumb: {
            label: "JSON file",
            navigateTo: PATHS.MOCK_SERVER_V2.CREATE.RELATIVE,
          },
        },
      },
      {
        path: PATHS.MOCK_SERVER_V2.EDIT.RELATIVE,
        element: <ProtectedRoute component={MockEditorIndex} mockType={MockType.API} />,
        handle: {
          breadcrumb: {
            label: "JSON file",
            navigateTo: PATHS.MOCK_SERVER_V2.EDIT.RELATIVE,
          },
        },
      },
      // FILES V2
      {
        path: PATHS.FILE_SERVER_V2.RELATIVE,
        element: <MocksListScreen type={MockType.FILE} />,
        handle: {
          breadcrumb: {
            label: "All",
            navigateTo: PATHS.FILE_SERVER_V2.RELATIVE,
          },
        },
      },
      {
        path: PATHS.FILE_SERVER_V2.CREATE.RELATIVE,
        element: <ProtectedRoute component={FileMockEditorCreateView} />,
        handle: {
          breadcrumb: {
            label: "JS/CSS file",
            navigateTo: PATHS.FILE_SERVER_V2.CREATE.RELATIVE,
          },
        },
      },
      {
        path: PATHS.FILE_SERVER_V2.EDIT.RELATIVE,
        element: <ProtectedRoute component={MockEditorIndex} mockType={MockType.FILE} />,
        handle: {
          breadcrumb: {
            label: "JS/CSS file",
            navigateTo: PATHS.FILE_SERVER_V2.EDIT.RELATIVE,
          },
        },
      },
    ],
  },
  {
    path: PATHS.MOCK_SERVER.INDEX,
    element: <Navigate to={PATHS.MOCK_SERVER_V2.ABSOLUTE} />,
  },
  {
    path: joinPaths(PATHS.LEGACY.FILES_LIBRARY.ABSOLUTE, "/:id"),
    element: <Navigate to={joinPaths(PATHS.FILES.VIEWER.ABSOLUTE, "/:id")} />,
  },
];
