import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt, toBool } from "../helpers";

/**
 * Internet, domain, and network variables:
 * $randomIP, $randomIPV6, $randomMACAddress, $randomPassword, $randomLocale,
 * $randomUserAgent, $randomProtocol, $randomDomainName, $randomDomainSuffix,
 * $randomDomainWord, $randomEmail, $randomExampleEmail, $randomUserName, $randomUrl
 */
export const createInternetVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$randomIP", "A random IPv4 address", "192.168.45.233", (...args: unknown[]) => {
    if (!args[0]) return faker.internet.ipv4();
    const param = String(args[0]);
    if (param.includes("/")) {
      return faker.internet.ipv4({ cidrBlock: param });
    }
    return faker.internet.ipv4({ network: param as any });
  }),
  createDynamicVariable("$randomIPV6", "A random IPv6 address", "2001:0db8:85a3:0000:0000:8a2e:0370:7334", () =>
    faker.internet.ipv6()
  ),
  createDynamicVariable("$randomMACAddress", "A random MAC address", "aa:bb:cc:dd:ee:ff", (...args: unknown[]) => {
    const separator = args[0] ? String(args[0]) : undefined;
    return faker.internet.mac(separator);
  }),
  createDynamicVariable(
    "$randomPassword",
    "A random 16-character alpha-numeric password",
    "8kP2mX9qL4nB5wV3",
    (...args: unknown[]) => {
      const length = args[0] ? toInt(args[0]) : 16;
      const memorable = toBool(args[1]);
      const pattern = args[2] ? new RegExp(String(args[2])) : undefined;
      const prefix = args[3] ? String(args[3]) : undefined;
      return faker.internet.password({ length, memorable, pattern, prefix });
    }
  ),
  createDynamicVariable("$randomLocale", "A random two-letter language code (ISO 3166-1)", "fr", () =>
    faker.location.countryCode("alpha-2").toLowerCase()
  ),
  createDynamicVariable(
    "$randomUserAgent",
    "A random user agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124",
    () => faker.internet.userAgent()
  ),
  createDynamicVariable("$randomProtocol", "A random internet protocol", "https", () => faker.internet.protocol()),
  createDynamicVariable("$randomDomainName", "A random domain name", "test-site.net", () =>
    faker.internet.domainName()
  ),
  createDynamicVariable("$randomDomainSuffix", "A random domain suffix", "org", () => faker.internet.domainSuffix()),
  createDynamicVariable("$randomDomainWord", "A random unqualified domain name", "sample", () =>
    faker.internet.domainWord()
  ),
  createDynamicVariable("$randomEmail", "A random email address", "sample@gmail.com", (...args: unknown[]) => {
    const firstName = args[0] ? String(args[0]) : undefined;
    const lastName = args[1] ? String(args[1]) : undefined;
    const provider = args[2] ? String(args[2]) : undefined;
    const allowSpecialCharacters = toBool(args[3]);
    return faker.internet.email({ firstName, lastName, provider, allowSpecialCharacters });
  }),
  createDynamicVariable(
    "$randomExampleEmail",
    "A random email address from an example domain",
    "alex.johnson@example.org",
    (...args: unknown[]) => {
      const firstName = args[0] ? String(args[0]) : undefined;
      const lastName = args[1] ? String(args[1]) : undefined;
      const allowSpecialCharacters = toBool(args[2]);
      return faker.internet.exampleEmail({ firstName, lastName, allowSpecialCharacters });
    }
  ),
  createDynamicVariable("$randomUserName", "A random username", "techuser2024", (...args: unknown[]) => {
    const firstName = args[0] ? String(args[0]) : undefined;
    const lastName = args[1] ? String(args[1]) : undefined;
    return faker.internet.username({ firstName, lastName });
  }),
  createDynamicVariable("$randomUrl", "A random URL", "https://demo-website.io", (...args: unknown[]) => {
    const protocol = args[0] as "http" | "https" | undefined;
    const appendSlash = toBool(args[1]);
    return faker.internet.url({ protocol, appendSlash });
  }),
];
