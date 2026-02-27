import Handlebars from "handlebars";
import type { DynamicVariable, VariableContext } from "../types";
import { DynamicVariableResolver } from "./DynamicVariableResolver";
import { DynamicVariableProvider } from "../providers";
import { DynamicVariableValueError } from "../errors";

/**
 * Handlebars-based resolver for dynamic variables.
 *
 * This resolver uses the Handlebars templating engine to parse and replace
 * dynamic variable placeholders in template strings.
 *
 * Why Handlebars?
 * 1. Native support for {{variable}} syntax - matches existing variable syntax
 * 2. Built-in argument parsing - {{$randomInt 1 100}} works out of the box
 * 3. Context-aware - can check user variables before falling back to generators
 * 4. Battle-tested library with good performance
 * 5. Isolated instances - Handlebars.create() prevents global pollution
 *
 * Context-Aware Helpers:
 * Each dynamic variable is registered as a helper that first checks if the
 * variable name exists in the user-provided context. This ensures:
 * - If user defines "$randomEmail" in environment → their value is used
 * - If not defined → the faker generator creates a random value
 *
 * @example
 * ```typescript
 * const resolver = new HandlebarsResolver(fakerProvider);
 *
 * // Basic usage
 * resolver.resolve("Hello {{$randomFirstName}}");
 * // → "Hello Michael"
 *
 * // With arguments
 * resolver.resolve("Age: {{$randomInt 18 65}}");
 * // → "Age: 42"
 * ```
 */
export class HandlebarsResolver extends DynamicVariableResolver {
  /**
   * Isolated Handlebars instance with registered dynamic variable helpers.
   * Using Handlebars.create() ensures helpers don't pollute the global instance.
   */
  private hbs: typeof Handlebars;
  private helpersRegistered = false;

  constructor(provider: DynamicVariableProvider) {
    super(provider);
    this.hbs = Handlebars.create();
    this.registerHelpers(this.hbs);
  }

  private createContextAwareHelper(
    variableName: string,
    generate: DynamicVariable["generate"]
  ): Handlebars.HelperDelegate {
    return function (this: VariableContext, ...args: unknown[]) {
      // Remove the Handlebars options object (always the last argument)
      const helperArgs = args.slice(0, -1);

      // 'this' is the Handlebars context (user variables passed to template)
      // If user has defined this variable use their value (e.g., collection or env variables)
      if (variableName in this && helperArgs.length === 0) {
        return this[variableName];
      }

      try {
        return generate(...helperArgs);
      } catch (error) {
        throw new DynamicVariableValueError(variableName, error);
      }
    };
  }

  private registerHelpers(hbs: typeof Handlebars): void {
    if (this.helpersRegistered) return;

    for (const variable of this.provider.list()) {
      const contextAwareHelper = this.createContextAwareHelper(variable.name, variable.generate);
      hbs.registerHelper(variable.name, contextAwareHelper);
    }

    this.helpersRegistered = true;
  }

  resolve(template: string, context: VariableContext = {}): string {
    const hbsTemplate = this.hbs.compile(template, {
      noEscape: true,
    });

    return hbsTemplate(context);
  }
}
