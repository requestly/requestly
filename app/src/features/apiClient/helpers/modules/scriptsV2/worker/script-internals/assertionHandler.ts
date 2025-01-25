import { LocalScopeResponse } from "./types";
import { verify } from "./utils";

export class AssertionHandler {
  constructor(private response: LocalScopeResponse) {}

  private throwAssertionError = (
    expectedValue: any,
    actualValue: any,
    isEqualityCheck: boolean,
    assertionTarget: string
  ) => {
    const errorMessage = isEqualityCheck
      ? `Expected ${assertionTarget} to be ${expectedValue}, but got ${actualValue}.`
      : `Expected ${assertionTarget} to not be ${expectedValue}, but got ${actualValue}.`;

    throw new AssertionError(errorMessage);
  };

  checkStatus = (expected: number | string | string[], checkEquality: boolean) => {
    const actualCode = this.response.code;
    if (typeof expected === "number") {
      try {
        verify(expected, actualCode, checkEquality);
      } catch {
        this.throwAssertionError(expected, actualCode, checkEquality, "response code");
      }
    } else {
      const actualInitialDigit = actualCode.toString()[0];
      const expectedValues = Array.isArray(expected) ? expected : [expected];

      expectedValues.forEach((status) => {
        const expectedInitialDigit = status[0];
        try {
          verify(expectedInitialDigit, actualInitialDigit, checkEquality);
        } catch {
          this.throwAssertionError(expectedValues.join(" or "), actualCode, checkEquality, "response code");
        }
      });
    }
  };

  haveBody = (expected: string, checkEquality: boolean) => {
    try {
      verify(this.response.body, expected, checkEquality);
    } catch {
      this.throwAssertionError(expected, this.response.body, checkEquality, "response body");
    }
  };

  haveStatus = (expected: number | string, checkEquality: boolean) => {
    const actualValue = typeof expected === "string" ? this.response.status : this.response.code;

    try {
      verify(actualValue, expected, checkEquality);
    } catch {
      this.throwAssertionError(expected, actualValue, checkEquality, "response status");
    }
  };

  haveHeader = (expected: string, checkEquality: boolean) => {
    const isHeaderFound = this.response.headers.some((header) => header.key.toLowerCase() === expected.toLowerCase());
    try {
      verify(isHeaderFound, true, checkEquality);
    } catch (e) {
      const condition = checkEquality ? "to have" : "to not have";
      throw new AssertionError(`Expected response ${condition} header with key '${expected}'.`);
    }
  };
}

class AssertionError extends Error {
  static name = "AssertionError";
  constructor(errorMessage: string) {
    super(errorMessage);
    this.name = AssertionError.name;
  }
}
