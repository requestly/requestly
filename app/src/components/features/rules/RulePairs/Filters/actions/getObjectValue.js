import { getFilterObjectPath } from "utils/rules/getFilterObjectPath";
const get = require("lodash/get");

const getObjectValue = (currentlySelectedRuleData, pairIndex, objectPath) => {
  return get(currentlySelectedRuleData.pairs[pairIndex], getFilterObjectPath(objectPath), "");
};

export default getObjectValue;
