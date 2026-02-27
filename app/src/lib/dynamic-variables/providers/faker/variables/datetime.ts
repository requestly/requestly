import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, withDateRefOptions, toBool } from "../helpers";

/**
 * Date, time, and database variables:
 * $randomDateFuture, $randomDatePast, $randomDateRecent, $randomWeekday, $randomMonth,
 * $randomDatabaseColumn, $randomDatabaseType, $randomDatabaseCollation, $randomDatabaseEngine
 */
export const createDateTimeVariables: CategoryCreator = (faker) => [
  // Dates
  createDynamicVariable(
    "$randomDateFuture",
    "A random future datetime",
    "Wed Nov 05 2027 18:30:22 GMT+0000 (UTC)",
    (...args: unknown[]) => withDateRefOptions((opts) => faker.date.future(opts), args, "years")
  ),
  createDynamicVariable(
    "$randomDatePast",
    "A random past datetime",
    "Mon Aug 14 2023 15:45:33 GMT+0000 (UTC)",
    (...args: unknown[]) => withDateRefOptions((opts) => faker.date.past(opts), args, "years")
  ),
  createDynamicVariable(
    "$randomDateRecent",
    "A random recent datetime",
    "Fri Feb 07 2026 10:20:15 GMT+0000 (UTC)",
    (...args: unknown[]) => withDateRefOptions((opts) => faker.date.recent(opts), args, "days")
  ),
  createDynamicVariable("$randomWeekday", "A random weekday", "Monday", (...args: unknown[]) => {
    const abbreviated = toBool(args[0]);
    const context = toBool(args[1]);
    return faker.date.weekday({ abbreviated, context });
  }),
  createDynamicVariable("$randomMonth", "A random month", "September", (...args: unknown[]) => {
    const abbreviated = toBool(args[0]);
    const context = toBool(args[1]);
    return faker.date.month({ abbreviated, context });
  }),

  // Databases
  createDynamicVariable("$randomDatabaseColumn", "A random database column name", "userId", () =>
    faker.database.column()
  ),
  createDynamicVariable("$randomDatabaseType", "A random database type", "varchar", () => faker.database.type()),
  createDynamicVariable("$randomDatabaseCollation", "A random database collation", "utf8_unicode_ci", () =>
    faker.database.collation()
  ),
  createDynamicVariable("$randomDatabaseEngine", "A random database engine", "InnoDB", () => faker.database.engine()),
];
