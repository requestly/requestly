import { getFilterObjectPath } from "utils/rules/getFilterObjectPath";
import deleteObjectAtPath from "./deleteObjectAtPath";
const set = require("lodash/set");
const get = require("lodash/get");

export const setReactSelectValue = (
  currentlySelectedRuleData,
  setCurrentlySelectedRule,
  pairIndex,
  newValues,
  targetPath,
  dispatch
) => {
  if (newValues === null || newValues.length === 0) {
    deleteObjectAtPath(currentlySelectedRuleData, setCurrentlySelectedRule, targetPath, pairIndex, dispatch);
  } else {
    const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
    const extractedValues = newValues.map((value) => value.value);
    set(copyOfCurrentlySelectedRule.pairs[pairIndex], getFilterObjectPath(targetPath), extractedValues);
    setCurrentlySelectedRule(dispatch, copyOfCurrentlySelectedRule, true);
  }
};

export const getReactSelectValue = (currentlySelectedRuleData, pairIndex, arrayPath, allOptions) => {
  const currentArray = get(currentlySelectedRuleData.pairs[pairIndex], getFilterObjectPath(arrayPath), []);
  return allOptions.filter((value) => currentArray.includes(value.value));
};
