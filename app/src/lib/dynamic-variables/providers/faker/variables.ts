import type { Faker } from "@faker-js/faker";
import type { DynamicVariable } from "../../types";
import { VariableScope } from "backend/environment/types";

/**
 * Helper function to create a dynamic variable with less boilerplate
 */
const v = (
  name: string,
  description: string,
  example: string,
  generate: (provider?: unknown) => any
): DynamicVariable => ({
  name,
  description,
  example,
  generate,
  scope: VariableScope.DYNAMIC,
});

function generateImageLink(category: string) {
  return `https://loremflickr.com/640/480/${category}`;
}
const companySuffixes = [
  "LLC",
  "Inc.",
  "Corp.",
  "Ltd.",
  "LLP",
  "LP",
  "PLC",
  "GmbH",
  "S.A.",
  "SARL",
  "BV",
  "NV",
  "Pty Ltd",
  "Pte Ltd",
  "SDN BHD",
  "KK",
  "AG",
  "SRL",
  "ULC",
  "OPC",
];

const toInt = (val: unknown): number => (typeof val === "string" ? parseInt(val, 10) : Number(val));

export function createFakerVariables(faker: Faker): DynamicVariable[] {
  return [
    // Common - 4
    v("$guid", "uuid-v4 style guid", "f47ac10b-58cc-4372-a567-0e02b2c3d479", (...args: unknown[]) => {
      if (!args[0] && !args[1]) return faker.string.uuid();
      const version = args[0] ? (toInt(args[0]) as 4 | 7) : undefined;
      const refDate = args[1]
        ? typeof args[1] === "string" || typeof args[1] === "number"
          ? args[1]
          : undefined
        : undefined;
      return faker.string.uuid({ version, refDate });
    }),
    v("$timestamp", "Current UNIX timestamp in seconds", "1739404800", () => Math.floor(Date.now() / 1000).toString()),
    v("$isoTimestamp", "Current ISO timestamp at zero UTC", "2026-02-13T14:25:30.177Z", () => new Date().toISOString()),
    v("$randomUUID", "A random 36-character UUID", "a3bb189e-8bf9-3888-9912-ace4e6543002", (...args: unknown[]) => {
      if (!args[0] && !args[1]) return faker.string.uuid();
      const version = args[0] ? (toInt(args[0]) as 4 | 7) : undefined;
      const refDate = args[1]
        ? typeof args[1] === "string" || typeof args[1] === "number"
          ? args[1]
          : undefined
        : undefined;
      return faker.string.uuid({ version, refDate });
    }),

    // Text, numbers, and colors - 6
    v("$randomAlphaNumeric", "A random alpha-numeric character", "t", (...args: unknown[]) => {
      if (!args[0]) return faker.string.alphanumeric(1);

      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);

      const casing = (hasMinMax ? args[2] : args[1]) as "upper" | "lower" | "mixed" | undefined;
      const exclude = (hasMinMax ? args[3] : args[2]) as string | undefined;

      return faker.string.alphanumeric({ length, casing, exclude });
    }),
    v("$randomBoolean", "A random boolean value", "false", (...args: unknown[]) => {
      const probability = args[0] ? Number(args[0]) : undefined;
      return probability !== undefined ? faker.datatype.boolean(probability) : faker.datatype.boolean();
    }),
    v("$randomInt", "A random integer between 0 and 10000", "472", (...args: unknown[]) => {
      if (!args[0]) return faker.number.int({ min: 0, max: 10000 });
      if (!args[1]) return faker.number.int({ min: 0, max: toInt(args[0]) });
      const min = toInt(args[0]);
      const max = toInt(args[1]);
      const multipleOf = args[2] ? toInt(args[2]) : undefined;
      return faker.number.int({ min, max, multipleOf });
    }),
    v("$randomColor", "A random human readablecolor", "blue", () => faker.color.human()),
    v("$randomHexColor", "A random hex value", "#2f8a45", (...args: unknown[]) => {
      const format = args[0] as "hex" | "css" | "binary" | undefined;
      const includeAlpha = args[1] === "true" || args[1] === true;
      const prefix = args[2] ? String(args[2]) : undefined;
      const casing = args[3] as "upper" | "lower" | "mixed" | undefined;
      return faker.color.rgb({ format: format || "hex", includeAlpha, prefix, casing });
    }),
    v("$randomAbbreviation", "A random abbreviation", "HTTP", () => faker.hacker.abbreviation()),

    // Internet and IP addresses - 8
    v("$randomIP", "A random IPv4 address", "192.168.45.233", (...args: unknown[]) => {
      if (!args[0]) return faker.internet.ipv4();
      // Check if it's a network type or cidr
      const param = String(args[0]);
      if (param.includes("/")) {
        return faker.internet.ipv4({ cidrBlock: param });
      }
      return faker.internet.ipv4({ network: param as any });
    }),
    v("$randomIPV6", "A random IPv6 address", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", () => faker.internet.ipv6()),
    v("$randomMACAddress", "A random MAC address", "aa:bb:cc:dd:ee:ff", (...args: unknown[]) => {
      const separator = args[0] ? String(args[0]) : undefined;
      return faker.internet.mac(separator);
    }),
    v("$randomPassword", "A random 16-character alpha-numeric password", "8kP2mX9qL4nB5wV3", (...args: unknown[]) => {
      const length = args[0] ? toInt(args[0]) : 15;
      const memorable = args[1] === "true" || args[1] === true;
      const pattern = args[2] ? new RegExp(String(args[2])) : undefined;
      const prefix = args[3] ? String(args[3]) : undefined;
      return faker.internet.password({ length, memorable, pattern, prefix });
    }),
    v("$randomLocale", "A random two-letter language code (ISO 639-1)", "fr", () =>
      faker.location.countryCode("alpha-2").toLowerCase()
    ),
    v(
      "$randomUserAgent",
      "A random user agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124",
      () => faker.internet.userAgent()
    ),
    v("$randomProtocol", "A random internet protocol", "https", () => faker.internet.protocol()),
    v("$randomSemver", "A random semantic version number", "3.12.4", () => faker.system.semver()),

    // Names - 5
    v("$randomFirstName", "A random first name", "Sarah", (...args: unknown[]) => {
      const sex = args[0] as "male" | "female" | undefined;
      return faker.person.firstName(sex);
    }),
    v("$randomLastName", "A random last name", "Johnson", (...args: unknown[]) => {
      const sex = args[0] as "male" | "female" | undefined;
      return faker.person.lastName(sex);
    }),
    v("$randomFullName", "A random first and last name", "Michael Anderson", (...args: unknown[]) => {
      const sex = args[0] as "male" | "female" | undefined;
      return faker.person.fullName({ sex });
    }),
    v("$randomNamePrefix", "A random name prefix", "Ms.", (...args: unknown[]) => {
      const sex = args[0] as "male" | "female" | undefined;
      return faker.person.prefix(sex);
    }),
    v("$randomNameSuffix", "A random name suffix", "Jr.", () => faker.person.suffix()),

    // Profession - 4
    v("$randomJobArea", "A random job area", "Security", () => faker.person.jobArea()),
    v("$randomJobDescriptor", "A random job descriptor", "Chief", () => faker.person.jobDescriptor()),
    v("$randomJobTitle", "A random job title", "Senior Data Analyst", () => faker.person.jobTitle()),
    v("$randomJobType", "A random job type", "Engineer", () => faker.person.jobType()),

    // Phone, address, and location - 9
    v("$randomPhoneNumber", "A random ten-digit phone number", "555-987-6543", (...args: unknown[]) => {
      const style = args[0] as "human" | "national" | "international" | undefined;
      return style ? faker.phone.number({ style }) : faker.phone.number();
    }),
    v("$randomPhoneNumberExt", "A random phone number with extension (12 digits)", "555-456-7890-321", () =>
      faker.phone.number()
    ),
    v("$randomCity", "A random city name", "Riverside", () => faker.location.city()),
    v("$randomStreetName", "A random street name", "Oak Avenue", () => faker.location.street()),
    v("$randomStreetAddress", "A random street address", "456 Elm Drive", (...args: unknown[]) => {
      const useFullAddress = args[0] === "true" || args[0] === true;
      return faker.location.streetAddress(useFullAddress);
    }),
    v("$randomCountry", "A random country", "Canada", () => faker.location.country()),
    v("$randomCountryCode", "A random two-letter country code (ISO 3166-1 alpha-2)", "US", (...args: unknown[]) => {
      const variant = (args[0] as "alpha-2" | "alpha-3" | "numeric") || "alpha-2";
      return faker.location.countryCode(variant);
    }),
    v("$randomLatitude", "A random latitude coordinate", "-23.5475", (...args: unknown[]) => {
      if (!args[0]) return faker.location.latitude();
      if (!args[1]) return faker.location.latitude({ max: toInt(args[0]) });
      const min = toInt(args[0]);
      const max = toInt(args[1]);
      const precision = args[2] ? toInt(args[2]) : undefined;
      return faker.location.latitude({ min, max, precision });
    }),
    v("$randomLongitude", "A random longitude coordinate", "151.2095", (...args: unknown[]) => {
      if (!args[0]) return faker.location.longitude();
      if (!args[1]) return faker.location.longitude({ max: toInt(args[0]) });
      const min = toInt(args[0]);
      const max = toInt(args[1]);
      const precision = args[2] ? toInt(args[2]) : undefined;
      return faker.location.longitude({ min, max, precision });
    }),

    // Images - 15
    v("$randomAvatarImage", "A random avatar image", "https://example.com/avatar/512x512", () => faker.image.avatar()),
    v("$randomImageUrl", "A URL of a random image", "https://example.com/images/640/480", (...args: unknown[]) => {
      const width = args[0] ? toInt(args[0]) : undefined;
      const height = args[1] ? toInt(args[1]) : undefined;
      return faker.image.url({ width, height });
    }),
    v("$randomAbstractImage", "A URL of a random abstract image", "https://loremflickr.com/640/480/abstract", () =>
      generateImageLink("abstract")
    ),
    v("$randomAnimalsImage", "A URL of a random animal image", "https://loremflickr.com/640/480/animals", () =>
      generateImageLink("animals")
    ),
    v(
      "$randomBusinessImage",
      "A URL of a random stock business image",
      "https://loremflickr.com/640/480/business",
      () => generateImageLink("business")
    ),
    v("$randomCatsImage", "A URL of a random cats image", "https://loremflickr.com/640/480/cats", () =>
      generateImageLink("cats")
    ),
    v("$randomCityImage", "A URL of a random city image", "https://loremflickr.com/640/480/city", () =>
      generateImageLink("city")
    ),
    v("$randomFoodImage", "A URL of a random food image", "https://loremflickr.com/640/480/food", () =>
      generateImageLink("food")
    ),
    v(
      "$randomNightlifeImage",
      "A URL of a random nightlife image",
      "https://example.com/images/nightlife/640/480",
      () => generateImageLink("nightlife")
    ),
    v("$randomFashionImage", "A URL of a random fashion image", "https://loremflickr.com/640/480/fashion", () =>
      generateImageLink("fashion")
    ),
    v("$randomPeopleImage", "A URL of a random image of a person", "https://loremflickr.com/640/480/people", () =>
      generateImageLink("people")
    ),
    v("$randomNatureImage", "A URL of a random nature image", "https://loremflickr.com/640/480/nature", () =>
      generateImageLink("nature")
    ),
    v("$randomSportsImage", "A URL of a random sports image", "https://loremflickr.com/640/480/sports", () =>
      generateImageLink("sports")
    ),
    v(
      "$randomTransportImage",
      "A URL of a random transportation image",
      "https://loremflickr.com/640/480/transport",
      () => generateImageLink("transport")
    ),
    v(
      "$randomImageDataUri",
      "A random image data URI",
      "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F...",
      (...args: unknown[]) => {
        const width = args[0] ? toInt(args[0]) : undefined;
        const height = args[1] ? toInt(args[1]) : undefined;
        const color = args[2] ? String(args[2]) : undefined;
        const type = args[3] as "svg-uri" | "svg-base64" | undefined;
        return faker.image.dataUri({ width, height, color, type });
      }
    ),

    // Finance - 10
    v("$randomBankAccount", "A random 8-digit bank account number", "78945612", (...args: unknown[]) =>
      faker.finance.accountNumber(args[0] ? toInt(args[0]) : 8)
    ),
    v("$randomBankAccountName", "A random bank account name", "Savings Account", () => faker.finance.accountName()),
    v("$randomCreditCardMask", "A random masked credit card number", "1234", (...args: unknown[]) => {
      const issuer = args[0] ? String(args[0]) : undefined;
      return faker.finance.creditCardNumber({ issuer }).slice(-4);
    }),
    v("$randomBankAccountBic", "A random BIC (Bank Identifier Code)", "DEUTDEFF", (...args: unknown[]) => {
      const includeBranchCode = args[0] === "true" || args[0] === true;
      return faker.finance.bic({ includeBranchCode });
    }),
    v(
      "$randomBankAccountIban",
      "A random 15-31 character IBAN (International Bank Account Number)",
      "GB82WEST12345698765432",
      (...args: unknown[]) => {
        const formatted = args[0] === "true" || args[0] === true;
        const countryCode = args[1] ? String(args[1]) : undefined;
        return faker.finance.iban({ formatted, countryCode });
      }
    ),
    v("$randomTransactionType", "A random transaction type", "payment", () => faker.finance.transactionType()),
    v("$randomCurrencyCode", "A random 3-letter currency code (ISO-4217)", "EUR", () => faker.finance.currencyCode()),
    v("$randomCurrencyName", "A random currency name", "US Dollar", () => faker.finance.currencyName()),
    v("$randomCurrencySymbol", "A random currency symbol", "€", () => faker.finance.currencySymbol()),
    v("$randomBitcoin", "A random bitcoin address", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", (...args: unknown[]) => {
      const type = args[0] as "legacy" | "segwit" | "bech32" | undefined;
      const network = args[1] as "mainnet" | "testnet" | undefined;
      return type || network ? faker.finance.bitcoinAddress({ type, network }) : faker.finance.bitcoinAddress();
    }),

    // Business - 6
    v("$randomCompanyName", "A random company name", "TechStart Solutions", () => faker.company.name()),
    v("$randomCompanySuffix", "A random company suffix", "LLC", () => faker.helpers.arrayElement(companySuffixes)),
    v("$randomBs", "A random phrase of business-speak", "streamline innovative platforms", () =>
      faker.company.buzzPhrase()
    ),
    v("$randomBsAdjective", "A random business-speak adjective", "dynamic", () => faker.company.buzzAdjective()),
    v("$randomBsBuzz", "A random business-speak buzzword", "optimize", () => faker.company.buzzVerb()),
    v("$randomBsNoun", "A random business-speak noun", "solutions", () => faker.company.buzzNoun()),

    // Catchphrases - 4
    v("$randomCatchPhrase", "A random catchphrase", "Innovative scalable methodology", () =>
      faker.company.catchPhrase()
    ),
    v("$randomCatchPhraseAdjective", "A random catchphrase adjective", "Robust", () =>
      faker.company.catchPhraseAdjective()
    ),
    v("$randomCatchPhraseDescriptor", "A random catchphrase descriptor", "cloud-based", () =>
      faker.company.catchPhraseDescriptor()
    ),
    v("$randomCatchPhraseNoun", "A random catchphrase noun", "framework", () => faker.company.catchPhraseNoun()),

    // Databases - 4
    v("$randomDatabaseColumn", "A random database column name", "userId", () => faker.database.column()),
    v("$randomDatabaseType", "A random database type", "varchar", () => faker.database.type()),
    v("$randomDatabaseCollation", "A random database collation", "utf8_unicode_ci", () => faker.database.collation()),
    v("$randomDatabaseEngine", "A random database engine", "InnoDB", () => faker.database.engine()),

    // Dates - 5
    v(
      "$randomDateFuture",
      "A random future datetime",
      "Wed Nov 05 2027 18:30:22 GMT+0000 (UTC)",
      (...args: unknown[]) => {
        const years = args[0] ? toInt(args[0]) : undefined;
        const refDate = args[1]
          ? typeof args[1] === "string" || typeof args[1] === "number"
            ? args[1]
            : undefined
          : undefined;
        return faker.date.future({ years, refDate });
      }
    ),
    v("$randomDatePast", "A random past datetime", "Mon Aug 14 2023 15:45:33 GMT+0000 (UTC)", (...args: unknown[]) => {
      const years = args[0] ? toInt(args[0]) : undefined;
      const refDate = args[1]
        ? typeof args[1] === "string" || typeof args[1] === "number"
          ? args[1]
          : undefined
        : undefined;
      return faker.date.past({ years, refDate });
    }),
    v(
      "$randomDateRecent",
      "A random recent datetime",
      "Fri Feb 07 2026 10:20:15 GMT+0000 (UTC)",
      (...args: unknown[]) => {
        const days = args[0] ? toInt(args[0]) : undefined;
        const refDate = args[1]
          ? typeof args[1] === "string" || typeof args[1] === "number"
            ? args[1]
            : undefined
          : undefined;
        return faker.date.recent({ days, refDate });
      }
    ),
    v("$randomWeekday", "A random weekday", "Monday", (...args: unknown[]) => {
      const abbreviated = args[0] === "true" || args[0] === true;
      const context = args[1] === "true" || args[1] === true;
      return faker.date.weekday({ abbreviated, context });
    }),
    v("$randomMonth", "A random month", "September", (...args: unknown[]) => {
      const abbreviated = args[0] === "true" || args[0] === true;
      const context = args[1] === "true" || args[1] === true;
      return faker.date.month({ abbreviated, context });
    }),

    // Domains, emails, and usernames - 7
    v("$randomDomainName", "A random domain name", "test-site.net", () => faker.internet.domainName()),
    v("$randomDomainSuffix", "A random domain suffix", "org", () => faker.internet.domainSuffix()),
    v("$randomDomainWord", "A random unqualified domain name", "sample", () => faker.internet.domainWord()),
    v("$randomEmail", "A random email address", "sample@gmail.com", (...args: unknown[]) => {
      const firstName = args[0] ? String(args[0]) : undefined;
      const lastName = args[1] ? String(args[1]) : undefined;
      const provider = args[2] ? String(args[2]) : undefined;
      const allowSpecialCharacters = args[3] === "true" || args[3] === true;
      return faker.internet.email({ firstName, lastName, provider, allowSpecialCharacters });
    }),
    v(
      "$randomExampleEmail",
      "A random email address from an example domain",
      "alex.johnson@example.org",
      (...args: unknown[]) => {
        const firstName = args[0] ? String(args[0]) : undefined;
        const lastName = args[1] ? String(args[1]) : undefined;
        const allowSpecialCharacters = args[2] === "true" || args[2] === true;
        return faker.internet.exampleEmail({ firstName, lastName, allowSpecialCharacters });
      }
    ),
    v("$randomUserName", "A random username", "techuser2024", (...args: unknown[]) => {
      const firstName = args[0] ? String(args[0]) : undefined;
      const lastName = args[1] ? String(args[1]) : undefined;
      return faker.internet.username({ firstName, lastName });
    }),
    v("$randomUrl", "A random URL", "https://demo-website.io", (...args: unknown[]) => {
      const protocol = args[0] as "http" | "https" | undefined;
      const appendSlash = args[1] === "true" || args[1] === true;
      return faker.internet.url({ protocol, appendSlash });
    }),

    // Files and directories - 9
    v(
      "$randomFileName",
      "A random file name (includes uncommon extensions)",
      "report_2024.pdf",
      (...args: unknown[]) => {
        if (!args[0]) return faker.system.fileName();
        const hasMinMax = args[1] && !isNaN(toInt(args[1]));
        const extensionCount = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
        return faker.system.fileName({ extensionCount });
      }
    ),
    v("$randomFileType", "A random file type (includes uncommon file types)", "video", () => faker.system.fileType()),
    v("$randomFileExt", "A random file extension (includes uncommon extensions)", "csv", (...args: unknown[]) => {
      const mimeType = args[0] ? String(args[0]) : undefined;
      return faker.system.fileExt(mimeType);
    }),
    v("$randomCommonFileName", "A random file name", "presentation.pptx", () => faker.system.commonFileName()),
    v("$randomCommonFileType", "A random, common file type", "image", () => faker.system.commonFileType()),
    v("$randomCommonFileExt", "A random, common file extension", "jpg", () => faker.system.commonFileExt()),
    v("$randomFilePath", "A random file path", "/var/www/html/index.html", () => faker.system.filePath()),
    v("$randomDirectoryPath", "A random directory path", "/opt/apps", () => faker.system.directoryPath()),
    v("$randomMimeType", "A random MIME type", "image/jpeg", () => faker.system.mimeType()),

    // Stores - 6
    v("$randomPrice", "A random price between 0.00 and 1000.00", "247.99", (...args: unknown[]) => {
      if (!args[0]) return faker.commerce.price();
      if (!args[1]) return faker.commerce.price({ min: 0, max: toInt(args[0]) });
      const min = toInt(args[0]);
      const max = toInt(args[1]);
      const dec = args[2] ? toInt(args[2]) : undefined;
      const symbol = args[3] ? String(args[3]) : undefined;
      return faker.commerce.price({ min, max, dec, symbol });
    }),
    v("$randomProduct", "A random product", "Shoes", () => faker.commerce.product()),
    v("$randomProductAdjective", "A random product adjective", "Premium", () => faker.commerce.productAdjective()),
    v("$randomProductMaterial", "A random product material", "Cotton", () => faker.commerce.productMaterial()),
    v("$randomProductName", "A random product name", "Ergonomic Wooden Chair", () => faker.commerce.productName()),
    v("$randomDepartment", "A random commerce category", "Electronics", () => faker.commerce.department()),

    // Grammar - 7
    v("$randomNoun", "A random noun", "network", (...args: unknown[]) => {
      if (!args[0]) return faker.word.noun();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      const strategy = (hasMinMax ? args[2] : args[1]) as
        | "fail"
        | "closest"
        | "shortest"
        | "longest"
        | "any-length"
        | undefined;
      return faker.word.noun({ length, strategy });
    }),
    v("$randomVerb", "A random verb", "generate", (...args: unknown[]) => {
      if (!args[0]) return faker.word.verb();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      const strategy = (hasMinMax ? args[2] : args[1]) as
        | "fail"
        | "closest"
        | "shortest"
        | "longest"
        | "any-length"
        | undefined;
      return faker.word.verb({ length, strategy });
    }),
    v("$randomIngverb", "A random verb ending in -ing", "processing", () => faker.word.verb() + "ing"),
    v("$randomAdjective", "A random adjective", "efficient", (...args: unknown[]) => {
      if (!args[0]) return faker.word.adjective();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      const strategy = (hasMinMax ? args[2] : args[1]) as
        | "fail"
        | "closest"
        | "shortest"
        | "longest"
        | "any-length"
        | undefined;
      return faker.word.adjective({ length, strategy });
    }),
    v("$randomWord", "A random word", "system", (...args: unknown[]) => {
      if (!args[0]) return faker.word.sample();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      const strategy = (hasMinMax ? args[2] : args[1]) as
        | "fail"
        | "closest"
        | "shortest"
        | "longest"
        | "any-length"
        | undefined;
      return faker.word.sample({ length, strategy });
    }),
    v("$randomWords", "Some random words", "quick brown fox jumps high", (...args: unknown[]) => {
      if (!args[0]) return faker.word.words(5);
      if (!args[1]) return faker.word.words(toInt(args[0]));
      const count = { min: toInt(args[0]), max: toInt(args[1]) };
      return faker.word.words({ count });
    }),
    v(
      "$randomPhrase",
      "A random phrase",
      "Try to compress the TCP protocol, maybe it will override the wireless array!",
      () => faker.hacker.phrase()
    ),

    // Lorem ipsum - 9
    v("$randomLoremWord", "A random word of lorem ipsum text", "ipsum", (...args: unknown[]) => {
      if (!args[0]) return faker.lorem.word();
      const hasMinMax = args[1] && !isNaN(toInt(args[1]));
      const length = hasMinMax ? { min: toInt(args[0]), max: toInt(args[1]) } : toInt(args[0]);
      const strategy = (hasMinMax ? args[2] : args[1]) as
        | "fail"
        | "closest"
        | "shortest"
        | "longest"
        | "any-length"
        | undefined;
      return faker.lorem.word({ length, strategy });
    }),
    v("$randomLoremWords", "Some random words of lorem ipsum text", "dolor sit amet", (...args: unknown[]) => {
      if (!args[0]) return faker.lorem.words(3);
      if (!args[1]) return faker.lorem.words(toInt(args[0]));
      return faker.lorem.words({ min: toInt(args[0]), max: toInt(args[1]) });
    }),
    v(
      "$randomLoremSentence",
      "A random sentence of lorem ipsum text",
      "Sed ut perspiciatis unde omnis iste natus.",
      (...args: unknown[]) => {
        if (!args[0]) return faker.lorem.sentence();
        if (!args[1]) return faker.lorem.sentence(toInt(args[0]));
        return faker.lorem.sentence({ min: toInt(args[0]), max: toInt(args[1]) });
      }
    ),
    v(
      "$randomLoremSentences",
      "A random 2 to 10 sentences of lorem ipsum text",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur. Ut enim ad minima veniam quis nostrum. Quis autem vel eum iure reprehenderit.",
      (...args: unknown[]) => {
        if (!args[0]) return faker.lorem.sentences({ min: 2, max: 6 });
        if (!args[1]) return faker.lorem.sentences(toInt(args[0]));
        if (!args[2]) return faker.lorem.sentences({ min: toInt(args[0]), max: toInt(args[1]) });
        return faker.lorem.sentences({ min: toInt(args[0]), max: toInt(args[1]) }, String(args[2]));
      }
    ),
    v(
      "$randomLoremParagraph",
      "A random paragraph of lorem ipsum text",
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      (...args: unknown[]) => {
        if (!args[0]) return faker.lorem.paragraph();
        if (!args[1]) return faker.lorem.paragraph(toInt(args[0]));
        return faker.lorem.paragraph({ min: toInt(args[0]), max: toInt(args[1]) });
      }
    ),
    v(
      "$randomLoremParagraphs",
      "3 random paragraphs of lorem ipsum text",
      `Voluptatem rem magnam aliquam ab id aut quaerat. Placeat provident possimus voluptatibus dicta velit non aut quasi. Mollitia et aliquam expedita sunt dolores nam consequuntur.  Nobis labore labore recusandae ipsam quo.\n
Voluptatem occaecati omnis debitis eum libero. Veniam et cum unde. Nisi facere repudiandae error aperiam expedita optio quae consequatur qui. Libero voluptatem eius occaecati ad sint voluptatibus laborum provident iure.\n
Autem est sequi ut tenetur omnis enim. Fuga nisi dolor expedita. Numquam optio magnam omnis architecto non. Est cumque laboriosam quibusdam eos voluptatibus velit omnis. Voluptatem officiis nulla omnis ratione excepturi.`,
      (...args: unknown[]) => {
        if (!args[0]) return faker.lorem.paragraphs(3, "\n");
        if (!args[1]) return faker.lorem.paragraphs(toInt(args[0]), "\n");
        if (!args[2]) return faker.lorem.paragraphs({ min: toInt(args[0]), max: toInt(args[1]) }, "\n");
        return faker.lorem.paragraphs({ min: toInt(args[0]), max: toInt(args[1]) }, String(args[2]));
      }
    ),
    v(
      "$randomLoremText",
      "A random amount of lorem ipsum text",
      "Temporibus autem quibusdam et aut officiis debitis. Aut rerum necessitatibus saepe eveniet ut et voluptates.",
      () => faker.lorem.text()
    ),
    v("$randomLoremSlug", "A random lorem ipsum URL slug", "lorem-ipsum-dolor", (...args: unknown[]) => {
      if (!args[0]) return faker.lorem.slug(3);
      if (!args[1]) return faker.lorem.slug(toInt(args[0]));
      return faker.lorem.slug({ min: toInt(args[0]), max: toInt(args[1]) });
    }),
    v(
      "$randomLoremLines",
      "1 to 7 random lines of lorem ipsum",
      "Sed ut perspiciatis unde.\nOmnis iste natus error.\nSit voluptatem accusantium.",
      (...args: unknown[]) => {
        if (args[1]) {
          return faker.lorem.lines({ min: toInt(args[0]), max: toInt(args[1]) });
        }
        return args[0] ? faker.lorem.lines(toInt(args[0])) : faker.lorem.lines({ min: 1, max: 7 });
      }
    ),
  ];
}
