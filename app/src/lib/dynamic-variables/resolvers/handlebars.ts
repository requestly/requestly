import Handlebars from "handlebars";
import type { VariableContext } from "../types";
import { DynamicVariableResolver } from "./DynamicVariableResolver";
import { DynamicVariableProvider } from "../providers";

export class HandlebarsResolver extends DynamicVariableResolver {
  private hbs: typeof Handlebars | null = null;
  private helpersRegistered = false;

  constructor(provider: DynamicVariableProvider) {
    super(provider);
    const hbs = this.getInstance();
    this.registerHelpers(hbs);
  }

  private createContextAwareHelper(
    variableName: string,
    generate: Handlebars.HelperDelegate
  ): Handlebars.HelperDelegate {
    return function (...args: unknown[]) {
      // 'this' is the Handlebars context (user variables), which is evaluated at runtime
      // If user has defined this variable, use their value eg collection or env variables
      if (variableName in this) {
        return this[variableName];
      }

      return generate.apply(this, args);
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

  private getInstance(): typeof Handlebars {
    if (this.hbs) {
      return this.hbs;
    }

    return Handlebars.create();
  }

  resolve(template: string, context: VariableContext = {}): string {
    const hbs = this.getInstance();

    const hbsTemplate = hbs.compile(template, {
      noEscape: true,
    });

    return hbsTemplate(context);
  }
}
