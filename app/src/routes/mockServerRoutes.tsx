import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { MockServerContainer } from "views/containers/MockServerContainer";
import FileViewer from "views/features/filesLibrary/FileViewer";
import { joinPaths } from "utils/PathUtils";
import FilesListIndex from "views/features/filesLibrary/FilesListIndex";
import FilesLibIndex from "views/features/filesLibrary/FilesLibIndex";
import MockEditorCreateView from "views/features/mocksV2/MockEditorCreateView";
import MockEditorEditView from "views/features/mocksV2/MockEditorEditView";
import MockListView from "views/features/mocksV2/MockListView";
import FileMockEditorCreateView from "views/features/mocksV2/FileMockEditorCreateView";
import FileMockEditorEditView from "views/features/mocksV2/FileMockEditorEditView";
import FileMockListView from "views/features/mocksV2/FileMockListView";

export const mockServerRoutes: RouteObject[] = [
  {
    path: PATHS.MOCK_SERVER.RELATIVE,
    element: <MockServerContainer />,
    children: [
      /** @deprecated */
      {
        path: PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE,
        element: <FilesListIndex />,
      },
      /** @deprecated */
      {
        path: PATHS.FILES.MY_FILES.ABSOLUTE,
        element: <FilesLibIndex />,
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
        element: <FileViewer />,
      },
      {
        path: joinPaths(PATHS.MOCK_SERVER.VIEWER.RELATIVE, PATHS.ANY),
        element: <FileViewer />,
      },
      //  MOCKS V2
      {
        index: true,
        path: PATHS.MOCK_SERVER_V2.RELATIVE,
        element: <MockListView />,
      },
      {
        path: PATHS.MOCK_SERVER_V2.CREATE.RELATIVE,
        element: <MockEditorCreateView />,
      },
      {
        path: PATHS.MOCK_SERVER_V2.EDIT.RELATIVE,
        element: <MockEditorEditView />,
      },
      // FILES V2
      {
        path: PATHS.FILE_SERVER_V2.RELATIVE,
        element: <FileMockListView />,
      },
      {
        path: PATHS.FILE_SERVER_V2.CREATE.RELATIVE,
        element: <FileMockEditorCreateView />,
      },
      {
        path: PATHS.FILE_SERVER_V2.EDIT.RELATIVE,
        element: <FileMockEditorEditView />,
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
