// import { useFeatureIsOn } from "@growthbook/growthbook-react";
import RulesListIndex from "./RulesListIndex";
import RulesIndexView from "views/features/rules/RulesIndexView";

const RulesIndexViewWrapper = () => {
  // const shouldShowNewRulesList = useFeatureIsOn("new-rule-table");
  const shouldShowNewRulesList = true;

  return shouldShowNewRulesList ? <RulesListIndex /> : <RulesIndexView />;
};

export default RulesIndexViewWrapper;
