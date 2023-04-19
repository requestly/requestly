//Actions
import { getEmptyPair, setCurrentlySelectedRule } from "../../../../actions";

export const addEmptyPair = (currentlySelectedRuleData, currentlySelectedRuleConfig, dispatch) => {
  const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));

  setCurrentlySelectedRule(
    dispatch,
    {
      ...copyOfCurrentlySelectedRule,
      pairs: [...copyOfCurrentlySelectedRule.pairs, getEmptyPair(currentlySelectedRuleConfig)],
    },
    true
  );
};
