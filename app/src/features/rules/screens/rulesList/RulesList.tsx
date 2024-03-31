import { useFeatureIsOn } from "@growthbook/growthbook-react";
import RulesList from "./components/RulesList/RulesList";
import RulesIndexView from "views/features/rules/RulesIndexView";

const RulesListScreen = () => {
  const shouldShowNewRulesList = useFeatureIsOn("new-rule-table");

  return shouldShowNewRulesList ? <RulesList /> : <RulesIndexView />;
};

export default RulesListScreen;
