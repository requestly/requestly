const PROXIED_LOG_PREFIX = "#script";

type Console = typeof console;

export class ScriptLogger {
  private originalConsole: Console;

  // Methods that should NOT be prefixed
  // If you add prefix in profile then it logs as "Profile '[RQ.Script] new_profile' started.""
  private readonly EXCLUDED_METHODS = ["profile"] as const;

  // Methods that accept variable arguments safely
  private readonly SAFE_PREFIX_METHODS = ["log", "error", "warn", "info", "debug", "trace"] as const;

  constructor() {
    this.originalConsole = console;
  }

  static logInfo(...args: any[]) {
    console.log(PROXIED_LOG_PREFIX, ...args);
  }

  createProxyConsole(): Console {
    const self = this;

    return new Proxy(this.originalConsole, {
      get(target, prop: keyof Console) {
        // handles non-string properties like console[Symbol.toStringTag]
        if (typeof prop !== "string") {
          return Reflect.get(target, prop);
        }

        const method = target[prop];

        // handles string objects like console.memory -> returns an object
        if (typeof method !== "function") {
          return method;
        }

        if (self.EXCLUDED_METHODS.includes(prop as any)) {
          return method.bind(target);
        }

        if (self.SAFE_PREFIX_METHODS.includes(prop as any)) {
          return (...args: any[]) => {
            method.call(target, PROXIED_LOG_PREFIX, ...args);
          };
        }

        // For other methods like time, count, group, etc.
        return (...args: any[]) => {
          try {
            // If first argument is a string or undefined, prefix it
            if (args.length === 0 || typeof args[0] === "string" || typeof args[0] === "undefined") {
              const label = args[0] || "";
              const prefixedLabel = `${PROXIED_LOG_PREFIX} ${label}`.trim();
              method.call(target, prefixedLabel, ...args.slice(1));
            } else {
              method.call(target, ...args);
            }
          } catch (error) {
            method.call(target, ...args);
          }
        };
      },
    }) as Console;
  }
}
