import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, withGender } from "../helpers";

/**
 * Person variables (names + profession):
 * $randomFirstName, $randomLastName, $randomFullName, $randomNamePrefix, $randomNameSuffix,
 * $randomJobArea, $randomJobDescriptor, $randomJobTitle, $randomJobType
 */
export const createPersonVariables: CategoryCreator = (faker) => [
  // Names
  createDynamicVariable("$randomFirstName", "A random first name", "Sarah", (...args: unknown[]) =>
    withGender((gender) => faker.person.firstName(gender), args)
  ),
  createDynamicVariable("$randomLastName", "A random last name", "Johnson", (...args: unknown[]) =>
    withGender((gender) => faker.person.lastName(gender), args)
  ),
  createDynamicVariable("$randomFullName", "A random first and last name", "Michael Anderson", (...args: unknown[]) =>
    withGender((gender) => faker.person.fullName({ sex: gender }), args)
  ),
  createDynamicVariable("$randomNamePrefix", "A random name prefix", "Ms.", (...args: unknown[]) =>
    withGender((gender) => faker.person.prefix(gender), args)
  ),
  createDynamicVariable("$randomNameSuffix", "A random name suffix", "Jr.", () => faker.person.suffix()),

  // Profession
  createDynamicVariable("$randomJobArea", "A random job area", "Security", () => faker.person.jobArea()),
  createDynamicVariable("$randomJobDescriptor", "A random job descriptor", "Chief", () => faker.person.jobDescriptor()),
  createDynamicVariable("$randomJobTitle", "A random job title", "Senior Data Analyst", () => faker.person.jobTitle()),
  createDynamicVariable("$randomJobType", "A random job type", "Engineer", () => faker.person.jobType()),
];
