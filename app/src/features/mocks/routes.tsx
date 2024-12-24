import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { joinPaths } from "utils/PathUtils";
import FileMockEditorCreateView from "views/features/mocksV2/FileMockEditorCreateView";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { MockType } from "components/features/mocksV2/types";
import MockEditorIndex from "components/features/mocksV2/MockEditorIndex";
import MocksFeatureContainer from "./container";
import { MocksListScreen } from "./screens/mocksList";

export const mockServerRoutes: RouteObject[] = [
  {
    path: PATHS.MOCK_SERVER.INDEX,
    element: <MocksFeatureContainer />,
    children: [
      //  MOCKS V2
      {
        index: true,
        element: <Navigate to={PATHS.MOCK_SERVER_V2.RELATIVE} />,
      },
      {
        path: PATHS.MOCK_SERVER_V2.RELATIVE,
        element: <MocksListScreen type={MockType.API} />,
      },
      {
        path: PATHS.MOCK_SERVER_V2.CREATE.RELATIVE,
        // @ts-ignore
        element: <ProtectedRoute component={MockEditorIndex} isNew={true} mockType={MockType.API} />,
      },
      {
        path: PATHS.MOCK_SERVER_V2.EDIT.RELATIVE,
        // @ts-ignore
        element: <ProtectedRoute component={MockEditorIndex} mockType={MockType.API} />,
      },
      // FILES V2
      {
        path: PATHS.FILE_SERVER_V2.RELATIVE,
        element: <MocksListScreen type={MockType.FILE} />,
      },
      {
        path: PATHS.FILE_SERVER_V2.CREATE.RELATIVE,
        element: <ProtectedRoute component={FileMockEditorCreateView} />,
      },
      {
        path: PATHS.FILE_SERVER_V2.EDIT.RELATIVE,
        // @ts-ignore
        element: <ProtectedRoute component={MockEditorIndex} mockType={MockType.FILE} />,
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
