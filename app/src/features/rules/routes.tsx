import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { RulesContainer } from "views/containers/RulesContainer";
import TrashIndexPage from "components/features/trash/TrashIndexPage";
import RuleEditor from "views/features/rules/RuleEditor";
import { joinPaths } from "utils/PathUtils";
import ImportSharedListIndexPage from "components/features/sharedLists/ImportSharedListIndexPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import RootComponent from "components/redirects/RootComponent";

// V2 Imports
import RulesContainerV2 from "./container";
import { RulesListScreen } from "./screens/rulesList";
import { SharedListsScreen } from "./screens/sharedLists";
import { TemplatesList } from "./screens/templatesList";
import { SharedListViewerScreen } from "./screens/sharedListViewer";

export const ruleRoutes: RouteObject[] = [
  {
    path: PATHS.RULES.INDEX,
    element: <RulesContainer />,
    children: [
      {
        path: PATHS.SHARED_LISTS.VIEWER.RELATIVE, // currently broken in prod
        element: <Navigate to={PATHS.SHARED_LISTS.ABSOLUTE} />,
      },
      {
        path: PATHS.SHARED_LISTS.IMPORT_LIST.RELATIVE, // for desktop app
        element: <ProtectedRoute component={ImportSharedListIndexPage} />,
      },
      {
        path: PATHS.RULES.TRASH.RELATIVE,
        element: <TrashIndexPage />,
      },
    ],
  },
  {
    path: PATHS.MARKETPLACE.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.ROOT,
    element: <RootComponent />,
  },
  {
    path: PATHS.INDEX_HTML,
    element: <RootComponent />,
  },
  // New V2 Routes
  {
    path: `${PATHS.RULES.INDEX}`,
    element: <RulesContainerV2 />,
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.RULES.MY_RULES.RELATIVE} />,
      },
      {
        path: `${PATHS.RULES.MY_RULES.RELATIVE}`,
        element: <RulesListScreen />,
      },
      // TODO:  VV Needs Refractoring below this VV
      {
        path: joinPaths(PATHS.RULE_EDITOR.RELATIVE, PATHS.ANY),
        element: <RuleEditor />,
      },
      {
        path: joinPaths(PATHS.RULE_EDITOR.CREATE_RULE.RELATIVE, "/:ruleType"),
        element: <RuleEditor />,
      },
      {
        path: PATHS.SHARED_LISTS.RELATIVE,
        element: <SharedListsScreen />,
      },
      {
        path: joinPaths(PATHS.SHARED_LISTS.VIEWER.RELATIVE, PATHS.ANY),
        element: <SharedListViewerScreen />,
      },
      {
        path: PATHS.RULES.TEMPLATES.RELATIVE,
        element: <TemplatesList />,
      },
    ],
  },
];
