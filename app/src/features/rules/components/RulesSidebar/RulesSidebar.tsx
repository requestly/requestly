import React, { useEffect } from "react";
import PATHS from "config/constants/sub/paths";
import MyRulesIcon from "assets/icons/http-rules/my-rules.svg?react";
import TemplatesIcon from "assets/icons/http-rules/templates.svg?react";
import SharedListIcon from "assets/icons/http-rules/shared-list.svg?react";
import { SecondarySidebar } from "componentsV2/SecondarySidebar";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { actions } from "store";

const rulesSidebarItems = [
  {
    title: "My Rules",
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
    icon: <MyRulesIcon />,
  },
  {
    title: "Shared lists",
    path: PATHS.SHARED_LISTS.RELATIVE,
    icon: <SharedListIcon />,
  },
  {
    title: "Templates",
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
    icon: <TemplatesIcon />,
  },
];

export const RulesSidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname.includes(PATHS.RULES.MY_RULES.ABSOLUTE)) {
      // @ts-ignore
      dispatch(actions.updateSecondarySidebarCollapse(false));
    } else if (location.pathname.startsWith(PATHS.RULE_EDITOR.ABSOLUTE)) {
      // @ts-ignore
      dispatch(actions.updateSecondarySidebarCollapse(true));
    } else {
      // @ts-ignore
      dispatch(actions.updateSecondarySidebarCollapse(false));
    }
  }, [dispatch, location]);

  return <SecondarySidebar items={rulesSidebarItems} />;
};
