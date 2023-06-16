import { Navigate, RouteObject } from "react-router-dom";
import TemplatesIndexPage from "components/landing/ruleTemplates";
import PATHS from "config/constants/sub/paths";
import { RulesContainer } from "views/containers/RulesContainer";
import RulesIndexView from "views/features/rules/RulesIndexView";
import SharedListsIndexView from "views/features/sharedLists/SharedListsIndexView";
import TrashIndexView from "views/features/trash/TrashIndexView";
import RuleEditor from "views/features/rules/RuleEditor";
import SharedListViewer from "views/features/sharedLists/SharedListViewer";
import { joinPaths } from "utils/PathUtils";
import SharedListImportView from "views/features/sharedLists/SharedListImportView";

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
        element: <SharedListsIndexView />,
      },
      {
        path: joinPaths(PATHS.SHARED_LISTS.VIEWER.RELATIVE, PATHS.ANY),
        element: <SharedListViewer />,
      },
      {
        path: PATHS.SHARED_LISTS.VIEWER.RELATIVE, // currently broken in prod
        element: <Navigate to={PATHS.SHARED_LISTS.ABSOLUTE} />,
      },
      {
        path: PATHS.SHARED_LISTS.IMPORT_LIST.RELATIVE, // for desktop app
        element: <SharedListImportView />,
      },
      {
        path: PATHS.RULES.TEMPLATES.RELATIVE,
        element: <TemplatesIndexPage />,
      },
      {
        path: PATHS.RULES.TRASH.RELATIVE,
        element: <TrashIndexView />,
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
