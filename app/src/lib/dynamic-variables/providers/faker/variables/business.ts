import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, companySuffixes } from "../helpers";

/**
 * Business and catchphrase variables:
 * $randomCompanyName, $randomCompanySuffix, $randomBs, $randomBsAdjective,
 * $randomBsBuzz, $randomBsNoun, $randomCatchPhrase, $randomCatchPhraseAdjective,
 * $randomCatchPhraseDescriptor, $randomCatchPhraseNoun
 */
export const createBusinessVariables: CategoryCreator = (faker) => [
  // Company
  createDynamicVariable("$randomCompanyName", "A random company name", "TechStart Solutions", () =>
    faker.company.name()
  ),
  createDynamicVariable("$randomCompanySuffix", "A random company suffix", "LLC", () =>
    faker.helpers.arrayElement(companySuffixes)
  ),
  createDynamicVariable("$randomBs", "A random phrase of business-speak", "streamline innovative platforms", () =>
    faker.company.buzzPhrase()
  ),
  createDynamicVariable("$randomBsAdjective", "A random business-speak adjective", "dynamic", () =>
    faker.company.buzzAdjective()
  ),
  createDynamicVariable("$randomBsBuzz", "A random business-speak buzzword", "optimize", () =>
    faker.company.buzzVerb()
  ),
  createDynamicVariable("$randomBsNoun", "A random business-speak noun", "solutions", () => faker.company.buzzNoun()),

  // Catchphrases
  createDynamicVariable("$randomCatchPhrase", "A random catchphrase", "Innovative scalable methodology", () =>
    faker.company.catchPhrase()
  ),
  createDynamicVariable("$randomCatchPhraseAdjective", "A random catchphrase adjective", "Robust", () =>
    faker.company.catchPhraseAdjective()
  ),
  createDynamicVariable("$randomCatchPhraseDescriptor", "A random catchphrase descriptor", "cloud-based", () =>
    faker.company.catchPhraseDescriptor()
  ),
  createDynamicVariable("$randomCatchPhraseNoun", "A random catchphrase noun", "framework", () =>
    faker.company.catchPhraseNoun()
  ),
];
