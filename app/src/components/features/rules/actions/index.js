import { actions } from "../../../../store";

export const unselectAllRules = (dispatch) => {
  //Unselect All Rules
  dispatch(actions.clearSelectedRules());
};

export const getSelectedRules = (rulesSelection) => {
  // why is this even needed?
  console.log("rulesSelection", rulesSelection);
  return Object.keys(rulesSelection).filter((ruleId) => rulesSelection[ruleId]);
};
