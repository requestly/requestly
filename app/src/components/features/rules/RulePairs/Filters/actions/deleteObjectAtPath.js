import { getFilterObjectPath } from "utils/rules/getFilterObjectPath";

const omit = require("lodash/omit");

const deleteObjectAtPath = (currentlySelectedRuleData, setCurrentlySelectedRule, targetPath, pairIndex, dispatch) => {
  const copyOfCurrentlySelectedRule = JSON.parse(JSON.stringify(currentlySelectedRuleData));
  targetPath = getFilterObjectPath(targetPath);
  if (typeof targetPath === "string") {
    setCurrentlySelectedRule(dispatch, omit(copyOfCurrentlySelectedRule, [`pairs[${pairIndex}].${targetPath}`]), true);
  } else {
    let arrayOfCompleteTargetPaths = targetPath.map(
      (_targetPath) => `pairs[${pairIndex}].${getFilterObjectPath(_targetPath)}`
    );
    setCurrentlySelectedRule(dispatch, omit(copyOfCurrentlySelectedRule, arrayOfCompleteTargetPaths), true);
  }
};

export default deleteObjectAtPath;
