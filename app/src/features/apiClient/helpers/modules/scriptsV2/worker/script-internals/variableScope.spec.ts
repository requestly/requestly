import { describe, expect, it } from "vitest";
import { VariableScope } from "./variableScope";
import { LocalScope } from "modules/localScope";
import { EnvironmentVariableType } from "backend/environment/types";

const createEnvironmentScope = (variableData: Record<string, any>) => {
  const localScope = new LocalScope({
    collectionVariables: {},
    environment: variableData,
    global: {},
    request: {} as any,
    response: null as any,
    variables: {},
    secrets: {},
  });

  return new VariableScope(localScope, "environment");
};

describe("VariableScope.get", () => {
  it("should return sync value when local value is empty", () => {
    const scope = createEnvironmentScope({
      my_var: {
        id: 1,
        type: EnvironmentVariableType.String,
        localValue: "",
        syncValue: "test_value",
        isPersisted: true,
      },
    });

    expect(scope.get("my_var")).toBe("test_value");
  });

  it("should return local boolean false without falling back to sync value", () => {
    const scope = createEnvironmentScope({
      my_var: {
        id: 1,
        type: EnvironmentVariableType.Boolean,
        localValue: false,
        syncValue: true,
        isPersisted: true,
      },
    });

    expect(scope.get("my_var")).toBe(false);
  });

  it("should return local number 0 without falling back to sync value", () => {
    const scope = createEnvironmentScope({
      my_var: {
        id: 1,
        type: EnvironmentVariableType.Number,
        localValue: 0,
        syncValue: 123,
        isPersisted: true,
      },
    });

    expect(scope.get("my_var")).toBe(0);
  });
});
