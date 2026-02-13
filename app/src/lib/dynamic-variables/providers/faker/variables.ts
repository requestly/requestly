import type { Faker } from "@faker-js/faker";
import type { DynamicVariable } from "../../types";

// TODO: Add more variables
export function createFakerVariables(faker: Faker): DynamicVariable[] {
  return [
    {
      name: "$randomEmail",
      description: "Random email. Usage: {{$randomEmail}} or {{$randomEmail 'gmail.com'}}",
      example: "john.doe@example.com",
      generate: (provider?: unknown) => {
        const opts = typeof provider === "string" ? { provider } : undefined;
        return faker.internet.email(opts);
      },
    },
    {
      name: "$randomFirstName",
      description: "Random first name. Usage: {{$randomFirstName}} or {{$randomFirstName 'male'}}",
      example: "John",
      generate: (gender?: unknown) => {
        const genderVal = gender === "male" || gender === "female" ? gender : undefined;
        return faker.person.firstName(genderVal);
      },
    },
    {
      name: "$randomFullName",
      description: "Random full name. Usage: {{$randomFullName}} or {{$randomFullName 'female'}}",
      example: "Jane Doe",
      generate: (gender?: unknown) => {
        const genderVal = gender === "male" || gender === "female" ? gender : undefined;
        return faker.person.fullName({ sex: genderVal });
      },
    },
  ];
}
