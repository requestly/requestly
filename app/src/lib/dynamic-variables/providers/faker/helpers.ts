import type { Faker } from "@faker-js/faker";
import type { DynamicVariable } from "../../types";
import { VariableScope } from "../../../../backend/environment/types";

export const createDynamicVariable = (
  name: string,
  description: string,
  example: string,
  generate: DynamicVariable["generate"]
): DynamicVariable => ({
  name,
  description,
  example,
  generate,
  scope: VariableScope.DYNAMIC,
});

export type CategoryCreator = (faker: Faker) => DynamicVariable[];

export const toInt = (val: unknown): number => (typeof val === "string" ? parseInt(val, 10) : Number(val));

export const toBool = (val: unknown): boolean => val === "true" || val === true;

export type LengthStrategy = "fail" | "closest" | "shortest" | "longest" | "any-length" | undefined;

/**
 * For variables that accept (length) or (min, max, strategy) pattern.
 * Used by: $randomNoun, $randomVerb, $randomAdjective, $randomWord,
 *          $randomLoremWord, $randomLoremSlug, $randomWords, etc.
 */
export const withLengthStrategy = (
  fn: (opts?: { length?: number | { min: number; max: number }; strategy?: LengthStrategy }) => string,
  args: unknown[]
): string => {
  if (!args[0]) return fn();
  const hasMinMax = args[1] && !isNaN(toInt(args[1]));
  const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
  const strategy = (hasMinMax ? args[2] : args[1]) as LengthStrategy;
  return fn({ length, strategy });
};

/**
 * For variables that accept a gender parameter.
 * Used by: $randomFirstName, $randomLastName, $randomFullName, $randomNamePrefix
 */
export const withGender = (fn: (gender?: "male" | "female") => string, args: unknown[]): string => {
  return fn(args[0] as "male" | "female" | undefined);
};

/**
 * For date variables that accept (years/days, refDate) pattern.
 * Used by: $randomDateFuture, $randomDatePast, $randomDateRecent
 */
export const withDateRefOptions = (
  fn: (opts?: { years?: number; days?: number; refDate?: string | number }) => Date,
  args: unknown[],
  paramName: "years" | "days" = "years"
): string => {
  const param = args[0] ? toInt(args[0]) : undefined;
  const refDate = typeof args[1] === "string" || typeof args[1] === "number" ? args[1] : undefined;
  return fn({ [paramName]: param, refDate }).toISOString();
};

/**
 * For variables that accept (count) or (min, max) pattern.
 * Used by: $randomLoremWords, $randomLoremSentence, $randomLoremParagraph, etc.
 */
export const withMinMaxCount = (
  fn: (countOrOpts?: number | { min: number; max: number }) => string,
  args: unknown[],
  defaultCount?: number
): string => {
  if (!args[0]) return fn(defaultCount);
  if (!args[1]) return fn(toInt(args[0]));
  return fn({ min: toInt(args[0]), max: toInt(args[1]) });
};

// ============================================
// Shared constants
// ============================================

export const companySuffixes = [
  "LLC",
  "Inc.",
  "Corp.",
  "Ltd.",
  "LLP",
  "LP",
  "PLC",
  "GmbH",
  "S.A.",
  "SARL",
  "BV",
  "NV",
  "Pty Ltd",
  "Pte Ltd",
  "SDN BHD",
  "KK",
  "AG",
  "SRL",
  "ULC",
  "OPC",
];

export function generateImageLink(category: string) {
  return `https://loremflickr.com/640/480/${category}`;
}

export const buildUuidOptions = (args: unknown[]) => {
  if (!args[0] && !args[1]) return undefined;
  const version = args[0] ? (toInt(args[0]) as 4 | 7) : undefined;
  const refDate = typeof args[1] === "string" || typeof args[1] === "number" ? args[1] : undefined;
  return { version, refDate };
};

export const generateUuid = (faker: Faker, ...args: unknown[]) => {
  const options = buildUuidOptions(args);
  return options ? faker.string.uuid(options) : faker.string.uuid();
};
