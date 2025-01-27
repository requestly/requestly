import { LocalScopeResponse } from "./types";
import { verify } from "./utils";
import Ajv, { Options as AjvOptions } from "ajv";

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

  checkStatus = (expectedValue: number | string | string[], checkEquality: boolean) => {
    const actualCode = this.response.code;
    if (typeof expectedValue === "number") {
      try {
        verify(expectedValue, actualCode, checkEquality);
      } catch {
        this.throwAssertionError(expectedValue, actualCode, checkEquality, "response code");
      }
    } else {
      const actualInitialDigit = actualCode.toString()[0];
      const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue];

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

  haveBody = (expectedValue: string, checkEquality: boolean) => {
    try {
      verify(this.response.body, expectedValue, checkEquality);
    } catch {
      this.throwAssertionError(expectedValue, this.response.body, checkEquality, "response body");
    }
  };

  haveStatus = (expectedValue: number | string, checkEquality: boolean) => {
    const actualValue = typeof expectedValue === "string" ? this.response.status : this.response.code;

    try {
      verify(actualValue, expectedValue, checkEquality);
    } catch {
      this.throwAssertionError(expectedValue, actualValue, checkEquality, "response status");
    }
  };

  haveHeader = (expectedValue: string, checkEquality: boolean) => {
    const isHeaderFound = this.response.headers.some(
      (header) => header.key.toLowerCase() === expectedValue.toLowerCase()
    );
    try {
      verify(isHeaderFound, true, checkEquality);
    } catch (e) {
      const condition = checkEquality ? "to have" : "to not have";
      throw new AssertionError(`Expected response ${condition} header with key '${expectedValue}'.`);
    }
  };

  haveJsonSchema(expected: any, checkEquality: true): void;
  // eslint-disable-next-line no-dupe-class-members
  haveJsonSchema(expected: any, checkEquality: true, config?: AjvOptions): void;
  // eslint-disable-next-line no-dupe-class-members
  haveJsonSchema(expected: any, checkEquality: boolean, config?: AjvOptions): void {
    const ajv = new Ajv(config || { allErrors: true });
    const validate = ajv.compile(expected);
    let parsedBody;

    try {
      parsedBody = typeof this.response.body === "string" ? JSON.parse(this.response.body) : this.response.body;
    } catch (e) {
      throw new AssertionError("Response body is not valid JSON");
    }

    const isValid = validate(parsedBody);
    try {
      verify(isValid, true, checkEquality);
    } catch {
      const errors = validate.errors?.map((err) => `${err.schemaPath} ${err.message}`).join(", ");
      throw new AssertionError(
        `Expected response body ${checkEquality ? "to match" : "to not match"} JSON schema${
          errors ? `: ${errors}` : ""
        }`
      );
    }
  }
}

class AssertionError extends Error {
  static name = "AssertionError";
  constructor(errorMessage: string) {
    super(errorMessage);
    this.name = AssertionError.name;
  }
}
