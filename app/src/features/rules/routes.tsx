import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { joinPaths } from "utils/PathUtils";

// Lazy-loaded components for better code splitting
const RulesContainer = lazy(() =>
  import("views/containers/RulesContainer").then((m) => ({ default: m.RulesContainer }))
);
const RuleEditor = lazy(() => import("views/features/rules/RuleEditor"));
const RulesContainerV2 = lazy(() => import("./container"));
const RulesListScreen = lazy(() => import("./screens/rulesList").then((m) => ({ default: m.RulesListScreen })));
const SharedListsScreen = lazy(() => import("./screens/sharedLists").then((m) => ({ default: m.SharedListsScreen })));
const TemplatesList = lazy(() => import("./screens/templatesList").then((m) => ({ default: m.TemplatesList })));
const SharedListViewerScreen = lazy(() =>
  import("./screens/sharedListViewer").then((m) => ({ default: m.SharedListViewerScreen }))
);

export const ruleRoutes: RouteObject[] = [
  {
    path: PATHS.RULES.INDEX,
    element: <RulesContainer />,
    children: [
      {
        path: PATHS.SHARED_LISTS.VIEWER.RELATIVE, // currently broken in prod
        element: <Navigate to={PATHS.SHARED_LISTS.ABSOLUTE} />,
      },
    ],
  },
  {
    path: PATHS.MARKETPLACE.RELATIVE,
    element: <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  // New V2 Routes
  {
    path: `${PATHS.RULES.INDEX}`,
    element: <RulesContainerV2 />,
    handle: {
      breadcrumb: {
        label: "Rules",
        navigateTo: PATHS.RULES.INDEX,
      },
    },
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.RULES.MY_RULES.RELATIVE} />,
        handle: {
          breadcrumb: {
            label: "All",
            disabled: true, // Will not navigate
          },
        },
      },
      {
        path: `${PATHS.RULES.MY_RULES.RELATIVE}`,
        element: <RulesListScreen />,
        handle: {
          breadcrumb: {
            label: "All",
            disabled: true,
          },
        },
      },
      // TODO:  VV Needs Refractoring below this VV
      {
        path: joinPaths(PATHS.RULE_EDITOR.RELATIVE, PATHS.ANY),
        element: <RuleEditor />,
        handle: {
          breadcrumb: {
            label: "Editor",
            isEditable: true,
            disabled: false,
          },
        },
      },
      {
        path: joinPaths(PATHS.RULE_EDITOR.CREATE_RULE.RELATIVE, "/:ruleType"),
        element: <RuleEditor />,
        handle: {
          breadcrumb: {
            label: "Create rule",
            disabled: true,
          },
        },
      },
      {
        path: PATHS.SHARED_LISTS.RELATIVE,
        element: <SharedListsScreen />,
        handle: {
          breadcrumb: {
            label: "Shared lists",
          },
        },
      },
      {
        path: joinPaths(PATHS.SHARED_LISTS.VIEWER.RELATIVE, PATHS.ANY),
        element: <SharedListViewerScreen />,
        handle: {
          breadcrumb: {
            label: "Shared list viewer",
            disabled: true,
          },
        },
      },
      {
        path: PATHS.RULES.TEMPLATES.RELATIVE,
        element: <TemplatesList />,
        handle: {
          breadcrumb: {
            label: "Templates",
          },
        },
      },
    ],
  },
];
