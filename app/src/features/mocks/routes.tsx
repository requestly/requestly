import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { MockServerContainer } from "views/containers/MockServerContainer";
import { joinPaths } from "utils/PathUtils";
import FilesLibraryIndexPage from "components/features/filesLibrary/FilesLibraryIndexPage";
import MyFilesLibraryView from "components/features/filesLibrary/FilesLibraryTableContainer/MyFilesView";
import FileMockEditorCreateView from "views/features/mocksV2/FileMockEditorCreateView";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import FileViewerIndexPage from "components/features/filesLibrary/FileViewerIndexPage";
import MockList from "components/features/mocksV2/MockList";
import { MockType } from "components/features/mocksV2/types";
import MockEditorIndex from "components/features/mocksV2/MockEditorIndex";

export const mockServerRoutes: RouteObject[] = [
  {
    path: PATHS.MOCK_SERVER.RELATIVE,
    element: <MockServerContainer />,
    children: [
      /** @deprecated */
      {
        path: PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE,
        element: <ProtectedRoute component={FilesLibraryIndexPage} />,
      },
      /** @deprecated */
      {
        path: PATHS.FILES.MY_FILES.ABSOLUTE,
        element: <ProtectedRoute component={MyFilesLibraryView} />,
      },
      /** @deprecated */
      {
        path: PATHS.MOCK_SERVER.RELATIVE,
        element: <Navigate to={PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE} />,
      },
      /** @deprecated */
      {
        path: PATHS.FILES.RELATIVE,
        element: <Navigate to={PATHS.FILES.MY_FILES.ABSOLUTE} />,
      },
      {
        path: joinPaths(PATHS.FILES.VIEWER.RELATIVE, PATHS.ANY),
        element: <ProtectedRoute component={FileViewerIndexPage} />,
      },
      {
        path: joinPaths(PATHS.MOCK_SERVER.VIEWER.RELATIVE, PATHS.ANY),
        element: <ProtectedRoute component={FileViewerIndexPage} />,
      },
      //  MOCKS V2
      {
        index: true,
        path: PATHS.MOCK_SERVER_V2.RELATIVE,
        element: <MockList type={MockType.API} />,
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
        element: <MockList type={MockType.FILE} />,
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
