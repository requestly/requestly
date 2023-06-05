import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import "./RulesSecondarySidebar.css";

const ruleRoutes = [
  {
    title: "My rules",
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
  },
  {
    title: "Shared list",
    path: PATHS.SHARED_LISTS.RELATIVE,
  },
  {
    title: "Templates",
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
  },
  {
    title: "Trash",
    path: PATHS.RULES.TRASH.ABSOLUTE,
  },
];

const createRuleEditorRoutes = Object.values(RULE_TYPES_CONFIG)
  .filter((ruleData) => ruleData.ID !== 11)
  .map(({ NAME, ICON, TYPE }) => ({
    title: NAME,
    icon: ICON,
    path: `${PATHS.RULE_EDITOR.CREATE_RULE.RELATIVE}/${TYPE}`,
  }));

export const RulesSecondarySidebar: React.FC = () => {
  const { pathname } = useLocation();
  const isRuleEditorOpenedInCreateMode = pathname.includes(PATHS.RULE_EDITOR.CREATE_RULE.RELATIVE);

  return (
    <div className="rules-secondary-sidebar-container">
      <ul>
        {(isRuleEditorOpenedInCreateMode ? createRuleEditorRoutes : ruleRoutes).map(({ path, title }) => (
          <li key={title}>
            <NavLink to={path} className={({ isActive }) => (isActive ? `rules-secondary-sidebar-active-link` : ``)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
