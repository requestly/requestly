import { FakerVariableProvider } from "./providers/faker/FakerVariableProvider";
import { HandlebarsResolver } from "./resolvers/handlebars";

export { DynamicVariableResolver } from "./resolvers/DynamicVariableResolver";
export { HandlebarsResolver } from "./resolvers/handlebars";

const fakerProvider = new FakerVariableProvider();
export const dynamicVariableResolver = new HandlebarsResolver(fakerProvider);
