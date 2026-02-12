import Handlebars from "handlebars";
import type { DynamicVariable, VariableContext } from "../types";
import { DynamicVariableResolver } from "./DynamicVariableResolver";
import { DynamicVariableProvider } from "../providers";

export class HandlebarsResolver extends DynamicVariableResolver {
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
    return function (ctx: VariableContext, ...args: unknown[]) {
      // If user has defined this variable, use their value ie collection or env variables
      if (variableName in ctx) {
        return ctx[variableName];
      }

      // Remove the Handlebars options object (last argument)
      const helperArgs = args.slice(0, -1);
      return generate(...helperArgs);
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
