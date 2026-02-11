import { FakerVariableProvider } from "./providers/faker/FakerVariableProvider";
import { HandlebarsResolver } from "./resolvers/handlebars";

const fakerProvider = new FakerVariableProvider();
export const dynamicVariables = new HandlebarsResolver(fakerProvider);
