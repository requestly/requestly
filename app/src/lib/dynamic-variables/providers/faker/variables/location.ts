import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt, toBool } from "../helpers";

/**
 * Phone, address, and location variables:
 * $randomPhoneNumber, $randomPhoneNumberExt, $randomCity, $randomStreetName,
 * $randomStreetAddress, $randomCountry, $randomCountryCode, $randomLatitude, $randomLongitude
 */
export const createLocationVariables: CategoryCreator = (faker) => [
  createDynamicVariable(
    "$randomPhoneNumber",
    "A random ten-digit phone number",
    "555-987-6543",
    (...args: unknown[]) => {
      const style = args[0] as "human" | "national" | "international" | undefined;
      return style ? faker.phone.number({ style }) : faker.phone.number();
    }
  ),
  createDynamicVariable("$randomPhoneNumberExt", "A random phone number with extension", "555-456-7890 x321", () => {
    const ext = faker.number.int({ min: 100, max: 9999 });
    return `${faker.phone.number()} x${ext}`;
  }),
  createDynamicVariable("$randomCity", "A random city name", "Riverside", () => faker.location.city()),
  createDynamicVariable("$randomStreetName", "A random street name", "Oak Avenue", () => faker.location.street()),
  createDynamicVariable("$randomStreetAddress", "A random street address", "456 Elm Drive", (...args: unknown[]) => {
    const useFullAddress = toBool(args[0]);
    return faker.location.streetAddress(useFullAddress);
  }),
  createDynamicVariable("$randomCountry", "A random country", "Canada", () => faker.location.country()),
  createDynamicVariable(
    "$randomCountryCode",
    "A random two-letter country code (ISO 3166-1 alpha-2)",
    "US",
    (...args: unknown[]) => {
      const variant = (args[0] as "alpha-2" | "alpha-3" | "numeric") || "alpha-2";
      return faker.location.countryCode(variant);
    }
  ),
  createDynamicVariable("$randomLatitude", "A random latitude coordinate", "-23.5475", (...args: unknown[]) => {
    if (!args[0]) return faker.location.latitude();
    if (!args[1]) return faker.location.latitude({ max: toInt(args[0]) });
    const min = toInt(args[0]);
    const max = toInt(args[1]);
    const precision = args[2] ? toInt(args[2]) : undefined;
    return faker.location.latitude({ min, max, precision });
  }),
  createDynamicVariable("$randomLongitude", "A random longitude coordinate", "151.2095", (...args: unknown[]) => {
    if (!args[0]) return faker.location.longitude();
    if (!args[1]) return faker.location.longitude({ max: toInt(args[0]) });
    const min = toInt(args[0]);
    const max = toInt(args[1]);
    const precision = args[2] ? toInt(args[2]) : undefined;
    return faker.location.longitude({ min, max, precision });
  }),
];
