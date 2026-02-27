import { DynamicVariableNotFoundError } from "../errors";
import type { DynamicVariable } from "../types";

/**
 * Abstract base class for dynamic variable providers.
 *
 * A provider is responsible for:
 * 1. Defining a set of dynamic variables (name, description, example, generator function)
 * 2. Storing them in a Map for O(1) lookup by name
 * 3. Exposing methods to generate values, list variables, and check existence
 *
 * This abstraction allows different data sources to provide dynamic variables:
 * - FakerVariableProvider: Uses faker.js for random data ($randomEmail, $randomFirstName)
 * - Future providers: Could use Chance.js, custom generators, or external APIs
 *
 * The provider pattern enables:
 * - Swappable implementations (dependency injection)
 * - Easy testing with mock providers
 * - Lazy loading of heavy dependencies (e.g., faker.js)
 *
 * @example
 * ```typescript
 * class CustomProvider extends DynamicVariableProvider {
 *   readonly name = "custom";
 *   readonly variableNames = new Map([
 *     ["$myVar", { name: "$myVar", description: "...", example: "...", generate: () => "value" }]
 *   ]);
 * }
 * ```
 */
export abstract class DynamicVariableProvider {
  abstract readonly name: string;
  abstract readonly variableNames: Map<string, DynamicVariable>;

  /**
   * Generate a value for the specified dynamic variable.
   *
   * @param name - The variable name (e.g., "$randomEmail")
   * @param args - Optional arguments passed to the generator (e.g., "$randomInt 1 100")
   * @returns The generated value (string, number, or boolean)
   * @throws DynamicVariableNotFoundError if the variable doesn't exist
   */
  generate(name: string, ...args: unknown[]): ReturnType<DynamicVariable["generate"]> {
    const variable = this.variableNames.get(name);

    if (!variable) {
      throw new DynamicVariableNotFoundError(name);
    }

    return variable.generate(...args);
  }

  getVariable(name: string): DynamicVariable | undefined {
    return this.variableNames.get(name);
  }

  has(name: string): boolean {
    return this.variableNames.has(name);
  }

  list(): DynamicVariable[] {
    return Array.from(this.variableNames.values());
  }
}
