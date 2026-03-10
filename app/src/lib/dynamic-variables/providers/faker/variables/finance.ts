import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt, toBool } from "../helpers";

/**
 * Finance variables:
 * $randomBankAccount, $randomBankAccountName, $randomCreditCardMask,
 * $randomBankAccountBic, $randomBankAccountIban, $randomTransactionType,
 * $randomCurrencyCode, $randomCurrencyName, $randomCurrencySymbol, $randomBitcoin
 */
export const createFinanceVariables: CategoryCreator = (faker) => [
  createDynamicVariable(
    "$randomBankAccount",
    "A random 8-digit bank account number",
    "78945612",
    (...args: unknown[]) => faker.finance.accountNumber(args[0] ? toInt(args[0]) : 8)
  ),
  createDynamicVariable("$randomBankAccountName", "A random bank account name", "Savings Account", () =>
    faker.finance.accountName()
  ),
  createDynamicVariable("$randomCreditCardMask", "A random masked credit card number", "1234", (...args: unknown[]) => {
    const issuer = args[0] ? String(args[0]) : undefined;
    return faker.finance.creditCardNumber({ issuer }).slice(-4);
  }),
  createDynamicVariable(
    "$randomBankAccountBic",
    "A random BIC (Bank Identifier Code)",
    "DEUTDEFF",
    (...args: unknown[]) => {
      const includeBranchCode = toBool(args[0]);
      return faker.finance.bic({ includeBranchCode });
    }
  ),
  createDynamicVariable(
    "$randomBankAccountIban",
    "A random 15-31 character IBAN (International Bank Account Number)",
    "GB82WEST12345698765432",
    (...args: unknown[]) => {
      const formatted = toBool(args[0]);
      const countryCode = args[1] ? String(args[1]) : undefined;
      return faker.finance.iban({ formatted, countryCode });
    }
  ),
  createDynamicVariable("$randomTransactionType", "A random transaction type", "payment", () =>
    faker.finance.transactionType()
  ),
  createDynamicVariable("$randomCurrencyCode", "A random 3-letter currency code (ISO-4217)", "EUR", () =>
    faker.finance.currencyCode()
  ),
  createDynamicVariable("$randomCurrencyName", "A random currency name", "US Dollar", () =>
    faker.finance.currencyName()
  ),
  createDynamicVariable("$randomCurrencySymbol", "A random currency symbol", "€", () => faker.finance.currencySymbol()),
  createDynamicVariable(
    "$randomBitcoin",
    "A random bitcoin address",
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    (...args: unknown[]) => {
      const type = args[0] as "legacy" | "segwit" | "bech32" | undefined;
      const network = args[1] as "mainnet" | "testnet" | undefined;
      return type || network ? faker.finance.bitcoinAddress({ type, network }) : faker.finance.bitcoinAddress();
    }
  ),
];
