import type { Faker } from "@faker-js/faker";
import type { DynamicVariable } from "../../../types";
import type { CategoryCreator } from "../helpers";

import { createCommonVariables } from "./common";
import { createTextVariables } from "./text";
import { createInternetVariables } from "./internet";
import { createPersonVariables } from "./person";
import { createLocationVariables } from "./location";
import { createImageVariables } from "./images";
import { createFinanceVariables } from "./finance";
import { createBusinessVariables } from "./business";
import { createDateTimeVariables } from "./datetime";
import { createFileVariables } from "./files";
import { createCommerceVariables } from "./commerce";
import { createWordVariables } from "./words";

/**
 * All category creators in registration order.
 * To add a new category, create a file in this directory and add its creator here.
 */
const categoryCreators: CategoryCreator[] = [
  createCommonVariables,
  createTextVariables,
  createInternetVariables,
  createPersonVariables,
  createLocationVariables,
  createImageVariables,
  createFinanceVariables,
  createBusinessVariables,
  createDateTimeVariables,
  createFileVariables,
  createCommerceVariables,
  createWordVariables,
];

/**
 * Creates all faker dynamic variables by combining all category creators.
 */
export function createFakerVariables(faker: Faker): DynamicVariable[] {
  return categoryCreators.flatMap((creator) => creator(faker));
}
