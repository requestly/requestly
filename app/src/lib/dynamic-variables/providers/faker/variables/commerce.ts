import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt } from "../helpers";

/**
 * Commerce/store variables:
 * $randomPrice, $randomProduct, $randomProductAdjective,
 * $randomProductMaterial, $randomProductName, $randomDepartment
 */
export const createCommerceVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$randomPrice", "A random price between 0.00 and 1000.00", "247.99", (...args: unknown[]) => {
    if (!args[0]) return faker.commerce.price();
    if (!args[1]) return faker.commerce.price({ min: 0, max: toInt(args[0]) });
    const min = toInt(args[0]);
    const max = toInt(args[1]);
    const dec = args[2] ? toInt(args[2]) : undefined;
    const symbol = args[3] ? String(args[3]) : undefined;
    return faker.commerce.price({ min, max, dec, symbol });
  }),
  createDynamicVariable("$randomProduct", "A random product", "Shoes", () => faker.commerce.product()),
  createDynamicVariable("$randomProductAdjective", "A random product adjective", "Premium", () =>
    faker.commerce.productAdjective()
  ),
  createDynamicVariable("$randomProductMaterial", "A random product material", "Cotton", () =>
    faker.commerce.productMaterial()
  ),
  createDynamicVariable("$randomProductName", "A random product name", "Ergonomic Wooden Chair", () =>
    faker.commerce.productName()
  ),
  createDynamicVariable("$randomDepartment", "A random commerce category", "Electronics", () =>
    faker.commerce.department()
  ),
];
