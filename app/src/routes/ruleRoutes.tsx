import { Navigate, RouteObject } from "react-router-dom";
import TemplatesIndexPage from "components/landing/ruleTemplates";
import PATHS from "config/constants/sub/paths";
import { RulesContainer } from "views/containers/RulesContainer";
import RulesIndexView from "views/features/rules/RulesIndexView";
import SharedListsIndexPage from "components/features/sharedLists/SharedListsIndexPage";
import TrashIndexPage from "components/features/trash/TrashIndexPage";
import RuleEditor from "views/features/rules/RuleEditor";
import SharedListViewerIndexPage from "components/features/sharedLists/SharedListViewerIndexPage";
import { joinPaths } from "utils/PathUtils";
import ImportSharedListIndexPage from "components/features/sharedLists/ImportSharedListIndexPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";

export const ruleRoutes: RouteObject[] = [
  {
    path: PATHS.RULES.INDEX,
    element: <RulesContainer />,
    children: [
      {
        path: "",
        element: <Navigate to={PATHS.RULES.MY_RULES.RELATIVE} />,
      },
      {
        index: true,
        path: PATHS.RULES.MY_RULES.RELATIVE,
        element: <RulesIndexView />,
      },
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
        element: <SharedListsIndexPage />,
      },
      {
        path: joinPaths(PATHS.SHARED_LISTS.VIEWER.RELATIVE, PATHS.ANY),
        element: <SharedListViewerIndexPage />,
      },
      {
        path: PATHS.SHARED_LISTS.VIEWER.RELATIVE, // currently broken in prod
        element: <Navigate to={PATHS.SHARED_LISTS.ABSOLUTE} />,
      },
      {
        path: PATHS.SHARED_LISTS.IMPORT_LIST.RELATIVE, // for desktop app
        element: <ProtectedRoute component={ImportSharedListIndexPage} />,
      },
      {
        path: PATHS.RULES.TEMPLATES.RELATIVE,
        element: <TemplatesIndexPage />,
      },
      {
        path: PATHS.RULES.TRASH.RELATIVE,
        element: <TrashIndexPage />,
      },
    ],
  },
  // redirects
  {
    path: PATHS.MARKETPLACE.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.ROOT,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.INDEX_HTML,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
];
