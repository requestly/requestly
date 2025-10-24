import React from "react";
import PATHS from "config/constants/sub/paths";
import MyRulesIcon from "assets/icons/http-rules/my-rules.svg?react";
import TemplatesIcon from "assets/icons/http-rules/templates.svg?react";
import SharedListIcon from "assets/icons/http-rules/shared-list.svg?react";
import { SecondarySidebar } from "componentsV2/SecondarySidebar";
import { useLocation } from "react-router-dom";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { RuleEditorMode } from "features/rules/types/rules";
import { RulesCreateModeSidebar } from "./RulesCreateModeSidebar/RulesCreateModeSidebar";

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
  const { MODE } = getModeData(location);
  const isCreateMode = MODE === RuleEditorMode.CREATE;

  return isCreateMode ? <RulesCreateModeSidebar /> : <SecondarySidebar items={rulesSidebarItems} />;
};
