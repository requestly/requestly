import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";

type CommandFunction = (ctx: ApiClientFeatureContext, ...args: unknown[]) => unknown;

type WithoutContextCommandFunction<T extends CommandFunction> = T extends (
  ctx: ApiClientFeatureContext,
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : never;

type CommandsMap = CommandFunction | { [key: string]: CommandsMap };

type CommandWithImplicitContext<T extends CommandsMap> = T extends CommandFunction
  ? WithoutContextCommandFunction<T>
  : T extends Record<string, any>
  ? { [K in keyof T]: CommandWithImplicitContext<T[K]> }
  : never;

function isCommandFunction<T extends CommandsMap>(obj: T): obj is Extract<T, CommandFunction> {
  return typeof obj === "function";
}

function isCommandObject<T extends CommandsMap>(obj: T): obj is Extract<T, Record<string, CommandsMap>> {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function bindSingleCommand<T extends CommandFunction>(
  ctx: ApiClientFeatureContext,
  fn: T
): WithoutContextCommandFunction<T> {
  return ((...args: any[]) => fn(ctx, ...args)) as WithoutContextCommandFunction<T>;
}

function bindCommandObject<T extends Record<string, CommandsMap>>(
  ctx: ApiClientFeatureContext,
  obj: T
): { [K in keyof T]: CommandWithImplicitContext<T[K]> } {
  const boundObj = {} as { [K in keyof T]: CommandWithImplicitContext<T[K]> };
  for (const key in obj) {
    boundObj[key] = bindCommands(ctx, obj[key]);
  }
  return boundObj;
}

export function bindCommands<T extends CommandsMap>(
  ctx: ApiClientFeatureContext,
  obj: T
): CommandWithImplicitContext<T> {
  if (isCommandFunction(obj)) {
    return bindSingleCommand(ctx, obj) as CommandWithImplicitContext<T>;
  }

  if (isCommandObject(obj)) {
    return bindCommandObject(ctx, obj) as CommandWithImplicitContext<T>;
  }

  throw new Error("Invalid command structure");
}
