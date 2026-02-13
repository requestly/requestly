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
  generate: (provider?: unknown) => string
): DynamicVariable => ({
  name,
  description,
  example,
  generate,
  scope: VariableScope.DYNAMIC,
});

export function createFakerVariables(faker: Faker): DynamicVariable[] {
  return [
    // Common
    v("$guid", "A uuid-v4 style guid", "f47ac10b-58cc-4372-a567-0e02b2c3d479", () => faker.string.uuid()),
    v("$timestamp", "The current UNIX timestamp in seconds", "1739404800", () =>
      Math.floor(Date.now() / 1000).toString()
    ),
    v("$isoTimestamp", "The current ISO timestamp at zero UTC", "2026-02-13T14:25:30.177Z", () =>
      new Date().toISOString()
    ),
    v("$randomUUID", "A random 36-character UUID", "a3bb189e-8bf9-3888-9912-ace4e6543002", () => faker.string.uuid()),

    // Text, numbers, and colors
    v("$randomAlphaNumeric", "A random alpha-numeric character", "x", () => faker.string.alphanumeric(1)),
    v("$randomBoolean", "A random boolean value", "false", () => faker.datatype.boolean().toString()),
    v("$randomInt", "A random integer between 0 and 1000", "472", () =>
      faker.number.int({ min: 0, max: 1000 }).toString()
    ),
    v("$randomColor", "A random color", "blue", () => faker.color.human()),
    v("$randomHexColor", "A random hex value", "#2f8a45", () => faker.internet.color()),
    v("$randomAbbreviation", "A random abbreviation", "HTTP", () => faker.hacker.abbreviation()),

    // Internet and IP addresses
    v("$randomIP", "A random IPv4 address", "192.168.45.233", () => faker.internet.ipv4()),
    v("$randomIPV6", "A random IPv6 address", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", () => faker.internet.ipv6()),
    v("$randomMACAddress", "A random MAC address", "aa:bb:cc:dd:ee:ff", () => faker.internet.mac()),
    v("$randomPassword", "A random 15-character alpha-numeric password", "8kP2mX9qL4nB5wV", () =>
      faker.internet.password({ length: 15 })
    ),
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

    // Names
    v("$randomFirstName", "A random first name", "Sarah", () => faker.person.firstName()),
    v("$randomLastName", "A random last name", "Johnson", () => faker.person.lastName()),
    v("$randomFullName", "A random first and last name", "Michael Anderson", () => faker.person.fullName()),
    v("$randomNamePrefix", "A random name prefix", "Ms.", () => faker.person.prefix()),
    v("$randomNameSuffix", "A random name suffix", "Jr.", () => faker.person.suffix()),

    // Profession
    v("$randomJobArea", "A random job area", "Security", () => faker.person.jobArea()),
    v("$randomJobDescriptor", "A random job descriptor", "Chief", () => faker.person.jobDescriptor()),
    v("$randomJobTitle", "A random job title", "Senior Data Analyst", () => faker.person.jobTitle()),
    v("$randomJobType", "A random job type", "Engineer", () => faker.person.jobType()),

    // Phone, address, and location
    v("$randomPhoneNumber", "A random ten-digit phone number", "555-987-6543", () => faker.phone.number()),
    v("$randomPhoneNumberExt", "A random phone number with extension (12 digits)", "555-456-7890-321", () =>
      faker.phone.number()
    ),
    v("$randomCity", "A random city name", "Riverside", () => faker.location.city()),
    v("$randomStreetName", "A random street name", "Oak Avenue", () => faker.location.street()),
    v("$randomStreetAddress", "A random street address", "456 Elm Drive", () => faker.location.streetAddress()),
    v("$randomCountry", "A random country", "Canada", () => faker.location.country()),
    v("$randomCountryCode", "A random two-letter country code (ISO 3166-1 alpha-2)", "US", () =>
      faker.location.countryCode("alpha-2")
    ),
    v("$randomLatitude", "A random latitude coordinate", "-23.5475", () => faker.location.latitude().toString()),
    v("$randomLongitude", "A random longitude coordinate", "151.2095", () => faker.location.longitude().toString()),

    // Images
    v("$randomAvatarImage", "A random avatar image", "https://example.com/avatar/512x512", () => faker.image.avatar()),
    v("$randomImageUrl", "A URL of a random image", "https://example.com/images/640/480", () => faker.image.url()),
    v("$randomAbstractImage", "A URL of a random abstract image", "https://example.com/images/abstract/640/480", () =>
      faker.image.urlLoremFlickr({ category: "abstract" })
    ),
    v("$randomAnimalsImage", "A URL of a random animal image", "https://example.com/images/animals/640/480", () =>
      faker.image.urlLoremFlickr({ category: "animals" })
    ),
    v(
      "$randomBusinessImage",
      "A URL of a random stock business image",
      "https://example.com/images/business/640/480",
      () => faker.image.urlLoremFlickr({ category: "business" })
    ),
    v("$randomCatsImage", "A URL of a random cat image", "https://example.com/images/cats/640/480", () =>
      faker.image.urlLoremFlickr({ category: "cats" })
    ),
    v("$randomCityImage", "A URL of a random city image", "https://example.com/images/city/640/480", () =>
      faker.image.urlLoremFlickr({ category: "city" })
    ),
    v("$randomFoodImage", "A URL of a random food image", "https://example.com/images/food/640/480", () =>
      faker.image.urlLoremFlickr({ category: "food" })
    ),
    v(
      "$randomNightlifeImage",
      "A URL of a random nightlife image",
      "https://example.com/images/nightlife/640/480",
      () => faker.image.urlLoremFlickr({ category: "nightlife" })
    ),
    v("$randomFashionImage", "A URL of a random fashion image", "https://example.com/images/fashion/640/480", () =>
      faker.image.urlLoremFlickr({ category: "fashion" })
    ),
    v("$randomPeopleImage", "A URL of a random image of a person", "https://example.com/images/people/640/480", () =>
      faker.image.urlLoremFlickr({ category: "people" })
    ),
    v("$randomNatureImage", "A URL of a random nature image", "https://example.com/images/nature/640/480", () =>
      faker.image.urlLoremFlickr({ category: "nature" })
    ),
    v("$randomSportsImage", "A URL of a random sports image", "https://example.com/images/sports/640/480", () =>
      faker.image.urlLoremFlickr({ category: "sports" })
    ),
    v(
      "$randomTransportImage",
      "A URL of a random transportation image",
      "https://example.com/images/transport/640/480",
      () => faker.image.urlLoremFlickr({ category: "transport" })
    ),
    v(
      "$randomImageDataUri",
      "A random image data URI",
      "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F...",
      () => faker.image.dataUri()
    ),

    // Finance
    v("$randomBankAccount", "A random 8-digit bank account number", "78945612", () => faker.finance.accountNumber(8)),
    v("$randomBankAccountName", "A random bank account name", "Savings Account", () => faker.finance.accountName()),
    v("$randomCreditCardMask", "A random masked credit card number", "1234", () =>
      faker.finance.creditCardNumber().slice(-4)
    ),
    v("$randomBankAccountBic", "A random BIC (Bank Identifier Code)", "DEUTDEFF", () => faker.finance.bic()),
    v(
      "$randomBankAccountIban",
      "A random 15-31 character IBAN (International Bank Account Number)",
      "GB82WEST12345698765432",
      () => faker.finance.iban()
    ),
    v("$randomTransactionType", "A random transaction type", "payment", () => faker.finance.transactionType()),
    v("$randomCurrencyCode", "A random 3-letter currency code (ISO-4217)", "EUR", () => faker.finance.currencyCode()),
    v("$randomCurrencyName", "A random currency name", "US Dollar", () => faker.finance.currencyName()),
    v("$randomCurrencySymbol", "A random currency symbol", "€", () => faker.finance.currencySymbol()),
    v("$randomBitcoin", "A random bitcoin address", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", () =>
      faker.finance.bitcoinAddress()
    ),

    // Business
    v("$randomCompanyName", "A random company name", "TechStart Solutions", () => faker.company.name()),
    v("$randomCompanySuffix", "A random company suffix", "LLC", () => faker.company.companySuffix()),
    v("$randomBs", "A random phrase of business-speak", "streamline innovative platforms", () =>
      faker.company.buzzPhrase()
    ),
    v("$randomBsAdjective", "A random business-speak adjective", "dynamic", () => faker.company.buzzAdjective()),
    v("$randomBsBuzz", "A random business-speak buzzword", "optimize", () => faker.company.buzzVerb()),
    v("$randomBsNoun", "A random business-speak noun", "solutions", () => faker.company.buzzNoun()),

    // Catchphrases
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

    // Databases
    v("$randomDatabaseColumn", "A random database column name", "userId", () => faker.database.column()),
    v("$randomDatabaseType", "A random database type", "varchar", () => faker.database.type()),
    v("$randomDatabaseCollation", "A random database collation", "utf8_unicode_ci", () => faker.database.collation()),
    v("$randomDatabaseEngine", "A random database engine", "InnoDB", () => faker.database.engine()),

    // Dates
    v("$randomDateFuture", "A random future datetime", "Wed Nov 05 2027 18:30:22 GMT+0000 (UTC)", () =>
      faker.date.future().toString()
    ),
    v("$randomDatePast", "A random past datetime", "Mon Aug 14 2023 15:45:33 GMT+0000 (UTC)", () =>
      faker.date.past().toString()
    ),
    v("$randomDateRecent", "A random recent datetime", "Fri Feb 07 2026 10:20:15 GMT+0000 (UTC)", () =>
      faker.date.recent().toString()
    ),
    v("$randomWeekday", "A random weekday", "Monday", () => faker.date.weekday()),
    v("$randomMonth", "A random month", "September", () => faker.date.month()),

    // Domains, emails, and usernames
    v("$randomDomainName", "A random domain name", "test-site.net", () => faker.internet.domainName()),
    v("$randomDomainSuffix", "A random domain suffix", "org", () => faker.internet.domainSuffix()),
    v("$randomDomainWord", "A random unqualified domain name", "sample", () => faker.internet.domainWord()),
    {
      name: "$randomEmail",
      description: "A random email address",
      example: "jane.smith@example.com",
      generate: (provider?: unknown) => {
        const opts = typeof provider === "string" ? { provider } : undefined;
        return faker.internet.email(opts);
      },
      scope: VariableScope.DYNAMIC,
    },
    v("$randomExampleEmail", "A random email address from an example domain", "alex.johnson@example.org", () =>
      faker.internet.exampleEmail()
    ),
    v("$randomUserName", "A random username", "techuser2024", () => faker.internet.userName()),
    v("$randomUrl", "A random URL", "https://demo-website.io", () => faker.internet.url()),

    // Files and directories
    v("$randomFileName", "A random file name (includes uncommon extensions)", "report_2024.pdf", () =>
      faker.system.fileName()
    ),
    v("$randomFileType", "A random file type (includes uncommon file types)", "video", () => faker.system.fileType()),
    v("$randomFileExt", "A random file extension (includes uncommon extensions)", "csv", () => faker.system.fileExt()),
    v("$randomCommonFileName", "A random file name", "presentation.pptx", () => faker.system.commonFileName()),
    v("$randomCommonFileType", "A random, common file type", "image", () => faker.system.commonFileType()),
    v("$randomCommonFileExt", "A random, common file extension", "jpg", () => faker.system.commonFileExt()),
    v("$randomFilePath", "A random file path", "/var/www/html/index.html", () => faker.system.filePath()),
    v("$randomDirectoryPath", "A random directory path", "/opt/apps", () => faker.system.directoryPath()),
    v("$randomMimeType", "A random MIME type", "image/jpeg", () => faker.system.mimeType()),

    // Stores
    v("$randomPrice", "A random price between 0.00 and 1000.00", "247.99", () => faker.commerce.price()),
    v("$randomProduct", "A random product", "Shoes", () => faker.commerce.product()),
    v("$randomProductAdjective", "A random product adjective", "Premium", () => faker.commerce.productAdjective()),
    v("$randomProductMaterial", "A random product material", "Cotton", () => faker.commerce.productMaterial()),
    v("$randomProductName", "A random product name", "Ergonomic Wooden Chair", () => faker.commerce.productName()),
    v("$randomDepartment", "A random commerce category", "Electronics", () => faker.commerce.department()),

    // Grammar
    v("$randomNoun", "A random noun", "network", () => faker.word.noun()),
    v("$randomVerb", "A random verb", "generate", () => faker.word.verb()),
    v("$randomIngverb", "A random verb ending in -ing", "processing", () => faker.word.verb() + "ing"),
    v("$randomAdjective", "A random adjective", "efficient", () => faker.word.adjective()),
    v("$randomWord", "A random word", "system", () => faker.word.sample()),
    v("$randomWords", "Some random words", "quick brown fox jumps high", () => faker.word.words(5)),
    v(
      "$randomPhrase",
      "A random phrase",
      "Try to compress the TCP protocol, maybe it will override the wireless array!",
      () => faker.hacker.phrase()
    ),

    // Lorem ipsum
    v("$randomLoremWord", "A random word of lorem ipsum text", "ipsum", () => faker.lorem.word()),
    v("$randomLoremWords", "Some random words of lorem ipsum text", "dolor sit amet", () => faker.lorem.words(3)),
    v(
      "$randomLoremSentence",
      "A random sentence of lorem ipsum text",
      "Sed ut perspiciatis unde omnis iste natus.",
      () => faker.lorem.sentence()
    ),
    v(
      "$randomLoremSentences",
      "A random 2 to 6 sentences of lorem ipsum text",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur. Ut enim ad minima veniam quis nostrum. Quis autem vel eum iure reprehenderit.",
      () => faker.lorem.sentences(3)
    ),
    v(
      "$randomLoremParagraph",
      "A random paragraph of lorem ipsum text",
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      () => faker.lorem.paragraph()
    ),
    v(
      "$randomLoremParagraphs",
      "3 random paragraphs of lorem ipsum text",
      "At vero eos et accusamus et iusto odio dignissimos ducimus. Qui blanditiis praesentium voluptatum deleniti atque corrupti.",
      () => faker.lorem.paragraphs(3)
    ),
    v(
      "$randomLoremText",
      "A random amount of lorem ipsum text",
      "Temporibus autem quibusdam et aut officiis debitis. Aut rerum necessitatibus saepe eveniet ut et voluptates.",
      () => faker.lorem.text()
    ),
    v("$randomLoremSlug", "A random lorem ipsum URL slug", "lorem-ipsum-dolor", () => faker.lorem.slug(3)),
    v(
      "$randomLoremLines",
      "1 to 5 random lines of lorem ipsum",
      "Sed ut perspiciatis unde.\nOmnis iste natus error.\nSit voluptatem accusantium.",
      () => faker.lorem.lines(3)
    ),
  ];
}
