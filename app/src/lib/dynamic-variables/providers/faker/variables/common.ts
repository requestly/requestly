import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, generateUuid } from "../helpers";

/**
 * Common/utility variables: $guid, $timestamp, $isoTimestamp, $randomUUID
 */
export const createCommonVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$guid", "uuid-v4 style guid", "f47ac10b-58cc-4372-a567-0e02b2c3d479", (...args: unknown[]) =>
    generateUuid(faker, ...args)
  ),
  createDynamicVariable("$timestamp", "Current UNIX timestamp in seconds", "1739404800", () =>
    Math.floor(Date.now() / 1000).toString()
  ),
  createDynamicVariable("$isoTimestamp", "Current ISO timestamp at zero UTC", "2026-02-13T14:25:30.177Z", () =>
    new Date().toISOString()
  ),
  createDynamicVariable(
    "$randomUUID",
    "A random 36-character UUID",
    "a3bb189e-8bf9-3888-9912-ace4e6543002",
    (...args: unknown[]) => generateUuid(faker, ...args)
  ),
];
