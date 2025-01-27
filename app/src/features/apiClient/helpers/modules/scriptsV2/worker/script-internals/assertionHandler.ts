import { LocalScopeResponse } from "./types";
import { verify } from "./utils";
import Ajv, { Options as AjvOptions } from "ajv";

interface HaveJsonBodyType {
  (): void;
  (expected: any, checkEquality: boolean): void;
  (expected: string, checkEquality: boolean): void;
  (expected: any, checkEquality: boolean, value: any): void;
}

interface HaveJsonSchemaType {
  (expected: any, checkEquality: boolean): void;
  (expected: any, checkEquality: boolean, config: AjvOptions): void;
}

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

  haveJsonBody: HaveJsonBodyType = (expected?: any, checkEquality?: boolean, value?: any): void => {
    let parsedBody: any;
    try {
      parsedBody = typeof this.response.body === "string" ? JSON.parse(this.response.body) : this.response.body;
    } catch (e) {
      throw new AssertionError("Response body is not valid JSON");
    }

    if (expected === undefined) {
      return;
    }
    if (typeof expected === "object") {
      let expectedJsonString;
      try {
        expectedJsonString = JSON.stringify(expected);
      } catch (e) {
        throw new AssertionError("Expected response body is not a valid JSON");
      }
      try {
        verify(expectedJsonString, this.response.body, checkEquality);
      } catch (e) {
        this.throwAssertionError(expectedJsonString, this.response.body, checkEquality, "response body");
      }
    }

    if (typeof expected === "string") {
      const pathParts = expected.split(".");
      let current = parsedBody;

      for (const part of pathParts) {
        if (current === undefined || current === null || !(part in current)) {
          if (checkEquality) {
            throw new AssertionError(`Expected property '${expected}' to be found in response body`);
          }
        }
        try {
          current = current[part];
        } catch (e) {
          if (!checkEquality) {
            throw new AssertionError(`Expected property '${expected}' to be not found in response body`);
          }
        }
      }

      if (!checkEquality && value === undefined && current !== undefined) {
        throw new AssertionError(`Expected property '${expected}' to be not found in response body`);
      }

      if (value !== undefined) {
        try {
          verify(current, value, checkEquality);
        } catch (e) {
          this.throwAssertionError(JSON.stringify(value), current, checkEquality, `property '${expected}'`);
        }
      }
    }
  };

  haveJsonSchema: HaveJsonSchemaType = (expected: any, checkEquality: boolean, config?: AjvOptions): void => {
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
      throw new AssertionError(`Expected response body ${checkEquality ? "to match" : "to not match"} JSON schema`);
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
