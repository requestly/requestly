import { get as lodashGet } from "lodash";
import { LocalScopeResponse } from "./types";
import { verify } from "./utils";
import Ajv, { Options as AjvOptions } from "ajv";

export class AssertionHandler {
  constructor(private response: LocalScopeResponse) {}

  private throwAssertionError(expectedValue: any, actualValue: any, isEqualityCheck: boolean, assertionTarget: string) {
    const errorMessage = isEqualityCheck
      ? `Expected ${assertionTarget} to be ${expectedValue}, but got ${actualValue}.`
      : `Expected ${assertionTarget} to not be ${expectedValue}, but got ${actualValue}.`;

    throw new AssertionError(errorMessage);
  }

  checkStatus(expectedValue: number | string | string[], checkEquality: boolean) {
    const actualCode = this.response?.code;
    if (typeof expectedValue === "number") {
      try {
        verify(expectedValue, actualCode, checkEquality);
      } catch {
        this.throwAssertionError(expectedValue, actualCode, checkEquality, "response code");
      }
    } else {
      const actualInitialDigit = actualCode?.toString()?.[0];
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
  }

  haveBody(expectedValue: string, checkEquality: boolean) {
    try {
      verify(this.response?.body, expectedValue, checkEquality);
    } catch {
      this.throwAssertionError(expectedValue, this.response?.body, checkEquality, "response body");
    }
  }

  haveStatus(expectedValue: number | string, checkEquality: boolean) {
    const actualValue = typeof expectedValue === "string" ? this.response?.status : this.response?.code;

    try {
      verify(actualValue, expectedValue, checkEquality);
    } catch {
      this.throwAssertionError(expectedValue, actualValue, checkEquality, "response status");
    }
  }

  haveHeader(expectedValue: string, checkEquality: boolean) {
    const isHeaderFound = this.response?.headers?.some(
      (header) => header.key.toLowerCase() === expectedValue.toLowerCase()
    );
    try {
      verify(isHeaderFound, true, checkEquality);
    } catch (e) {
      const condition = checkEquality ? "to have" : "to not have";
      throw new AssertionError(`Expected response ${condition} header with key '${expectedValue}'.`);
    }
  }

  haveJsonBody(): boolean;
  // haveJsonBody(path: object, isEqualityCheck: boolean): void; //TODO: pass for all use case
  haveJsonBody(path: string, isEqualityCheck: boolean): void;
  haveJsonBody(path: string, isEqualityCheck: boolean, value: any): void;
  haveJsonBody(path?: string, isEqualityCheck?: boolean, value?: any): void | boolean {
    if (path === undefined) {
      try {
        this.response?.json();
      } catch {
        this.throwAssertionError(
          "a valid JSON",
          `${isEqualityCheck ? "invalid JSON" : "valid JSON"}`,
          !!isEqualityCheck,
          "response body"
        );
      }
    }

    if (typeof path === "string") {
      const responseBody = this.response?.json();
      const pathValue = lodashGet(responseBody, path);

      if (typeof value !== "undefined") {
        try {
          verify(pathValue, value, isEqualityCheck);
        } catch {
          throw new AssertionError(
            `Expected response body json at '${path}' to ${!isEqualityCheck ? "not " : ""}have ${JSON.stringify(
              value
            )}, but got ${JSON.stringify(pathValue)}`
          );
        }
      } else {
        const isPathValueExists = !!pathValue;
        try {
          verify(isPathValueExists, true, isEqualityCheck);
        } catch {
          throw new AssertionError(
            `Expected property '${path}' to be ${!isEqualityCheck ? "not " : ""}found in response body.`
          );
        }
      }
    }
  }

  haveJsonSchema(expectedSchema: any, isEqualityCheck: boolean): void;
  haveJsonSchema(expectedSchema: any, isEqualityCheck: boolean, config: AjvOptions): void;
  haveJsonSchema(expectedSchema: any, isEqualityCheck: boolean, config?: AjvOptions): void {
    const ajv = new Ajv(config || { allErrors: true });
    const validate = ajv.compile(expectedSchema);

    const isValid = validate(this.response?.json());
    try {
      verify(isValid, true, isEqualityCheck);
    } catch {
      throw new AssertionError(`Expected response body ${isEqualityCheck ? "to match" : "to not match"} JSON schema.`);
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
