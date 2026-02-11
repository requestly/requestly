import { faker } from "@faker-js/faker";
import type { DynamicVariable } from "../../types";
import { DynamicVariableProvider } from "../DynamicVariableProvider";
import { createFakerVariables } from "./variables";

export class FakerVariableProvider extends DynamicVariableProvider {
  readonly name = "faker";

  readonly variables: Map<string, DynamicVariable>;

  constructor() {
    super();
    const fakerVariables = createFakerVariables(faker);
    this.variables = new Map(fakerVariables.map((v) => [v.name, v]));
  }
}
