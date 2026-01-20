import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

type CommandFunction = (ctx: ApiClientFeatureContext, ...args: any[]) => any;

type WithoutContext<T extends CommandFunction> = T extends (
  ctx: ApiClientFeatureContext,
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : never;

export type BoundCommands<T> = {
  [Scope in keyof T]: {
    [Cmd in keyof T[Scope]]: T[Scope][Cmd] extends CommandFunction ? WithoutContext<T[Scope][Cmd]> : never;
  };
};

function bindCommand<T extends CommandFunction>(ctx: ApiClientFeatureContext, fn: T): WithoutContext<T> {
  return ((...args: any[]) => fn(ctx, ...args)) as WithoutContext<T>;
}

export function bindCommands<T extends Record<string, Record<string, CommandFunction>>>(
  ctx: ApiClientFeatureContext,
  commands: T
): BoundCommands<T> {
  const result = {} as any;

  for (const scope in commands) {
    result[scope] = {};
    for (const cmd in commands[scope]) {
      result[scope][cmd] = bindCommand(ctx, commands[scope][cmd]);
    }
  }

  return result;
}
