import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt } from "../helpers";

/**
 * Text, numbers, and color variables:
 * $randomAlphaNumeric, $randomBoolean, $randomInt, $randomColor, $randomHexColor, $randomAbbreviation
 */
export const createTextVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$randomAlphaNumeric", "A random alpha-numeric character", "t", (...args: unknown[]) => {
    if (!args[0]) return faker.string.alphanumeric(1);

    const hasMinMax = args[1] && !isNaN(toInt(args[1]));
    const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);

    const casing = (hasMinMax ? args[2] : args[1]) as "upper" | "lower" | "mixed" | undefined;
    const exclude = (hasMinMax ? args[3] : args[2]) as string | undefined;

    return faker.string.alphanumeric({ length, casing, exclude });
  }),
  createDynamicVariable("$randomBoolean", "A random boolean value", "false", (...args: unknown[]) => {
    const probability = args[0] ? Number(args[0]) : undefined;
    return probability !== undefined ? faker.datatype.boolean(probability) : faker.datatype.boolean();
  }),
  createDynamicVariable("$randomInt", "A random integer between 0 and 10000", "472", (...args: unknown[]) => {
    if (!args[0]) return faker.number.int({ min: 0, max: 10000 });
    if (!args[1]) return faker.number.int({ min: 0, max: toInt(args[0]) });
    const min = toInt(args[0]);
    const max = toInt(args[1]);
    const multipleOf = args[2] ? toInt(args[2]) : undefined;
    return faker.number.int({ min, max, multipleOf });
  }),
  createDynamicVariable("$randomColor", "A random human readable color", "blue", () => faker.color.human()),
  createDynamicVariable("$randomHexColor", "A random hex value", "#2f8a45", (...args: unknown[]) => {
    const format = args[0] as "hex" | "css" | "binary" | undefined;
    const includeAlpha = args[1] === "true" || args[1] === true;
    const prefix = args[2] ? String(args[2]) : undefined;
    const casing = args[3] as "upper" | "lower" | "mixed" | undefined;
    return faker.color.rgb({ format: format || "hex", includeAlpha, prefix, casing });
  }),
  createDynamicVariable("$randomAbbreviation", "A random abbreviation", "HTTP", () => faker.hacker.abbreviation()),
];
