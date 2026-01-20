import { isEqual } from "lodash";

export const verify = (actualValue: any, expectedValue: any, checkEquality: boolean = true) => {
  if (
    (checkEquality && !isEqual(actualValue, expectedValue)) ||
    (!checkEquality && isEqual(actualValue, expectedValue))
  ) {
    throw new Error(`Expected ${expectedValue} but got ${actualValue}.`);
  }
};
