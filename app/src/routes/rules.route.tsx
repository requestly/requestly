import { Navigate } from "react-router-dom";
import TemplatesIndexPage from "components/landing/ruleTemplates";
import PATHS from "config/constants/sub/paths";
import { RulesContainer } from "views/containers/RulesContainer/RulesContainer";
import RulesIndexView from "views/features/rules/RulesIndexView";
import SharedListsIndexView from "views/features/sharedLists/SharedListsIndexView";
import TrashIndexView from "views/features/trash/TrashIndexView";
import RuleEditor from "views/features/rules/RuleEditor";

// highlighting the sub routes
// fix all the sub routes (ie remove new routes)
// continue with the other screens

export const rulesRoutes = [
  {
    path: "/",
    element: <Navigate to={PATHS.NEW.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.MARKETPLACE.RELATIVE,
    element: <Navigate to={PATHS.NEW.RULES.TEMPLATES.ABSOLUTE} />,
  },
  {
    path: PATHS.NEW.RULES.INDEX,
    element: <RulesContainer />,

    children: [
      {
        path: "*",
        element: <Navigate to={PATHS.NEW.RULES.MY_RULES.RELATIVE} />,
      },
      {
        index: true,
        path: PATHS.NEW.RULES.MY_RULES.RELATIVE,
        element: <RulesIndexView />,
      },
      {
        path: "editor" + "/" + PATHS.ANY,
        element: <RuleEditor location={window.location} />,
      },
      {
        path: PATHS.NEW.RULES.SHARED_LISTS.RELATIVE,
        element: <SharedListsIndexView />,
      },
      {
        path: PATHS.NEW.RULES.TEMPLATES.RELATIVE,
        element: <TemplatesIndexPage />,
      },
      {
        path: PATHS.NEW.RULES.TRASH.RELATIVE,
        element: <TrashIndexView />,
      },
    ],
  },
];
