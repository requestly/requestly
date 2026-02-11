import type Handlebars from "handlebars";

export interface DynamicVariable {
  name: string;
  description: string;
  example: string;
  generate: Handlebars.HelperDelegate;
}

export type VariableContext = Record<string, string | number | boolean | undefined>;
