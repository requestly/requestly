import { EnvironmentVariables, EnvironmentVariableType } from "backend/environment/types";

export namespace rq {
  export const namespace = "rq";

  export const somethingElse = (): string => {
    return "anything";
  };

  export function format(input: string, options?: any): Boolean {
    return input && options;
  }

  export const count: number = 5;

  export function dummyVariables(): EnvironmentVariables {
    return {
      somethig: {
        localValue: "value",
        syncValue: "syncValue",
        type: EnvironmentVariableType.String,
        id: 1,
      },
    };
  }
}
