import { generate } from "@requestly/colors";

type SeedTokenKeys = "primary" | "neutral" | "success" | "error" | "warning";
type MapTokenVariations = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type MapTokenKeys = `${SeedTokenKeys}-${MapTokenVariations}`;
type AliasTokenKeys =
  | "primary-light"
  | "primary-text"
  | "background"
  | "surface-1"
  | "surface-2"
  | "surface-3"
  | "text-placeholder"
  | "text-subtle";

export type SeedTokens = {
  [key in SeedTokenKeys]: string;
};

export type MapTokens = {
  [key in MapTokenKeys]: string;
};

export type AliasTokens = {
  [key in AliasTokenKeys]: string;
};

export const generateColorTokens = (
  primary = "#004EEB",
  neutral = "#787878",
  success = "#0BAA60",
  error = "#E43434",
  warning = "#E09400"
) => {
  const seedTokens = { primary, neutral, success, error, warning };
  const mapTokens = generateMapTokens(seedTokens);
  const aliasTokens = generateAliasTokens(seedTokens, mapTokens);

  return {
    ...seedTokens,
    ...mapTokens,
    ...aliasTokens,
  };
};

const generateMapTokens = (seedTokens: SeedTokens) => {
  const mapTokens: MapTokens = {} as MapTokens;

  Object.entries(seedTokens).forEach(([key, value]) => {
    generate(value).forEach((color, index) => {
      mapTokens[`${key}-${(index + 1) * 100}` as MapTokenKeys] = color;
    });
  });

  return mapTokens;
};

const generateAliasTokens = (seedTokens: SeedTokens, mapTokens: MapTokens) => {
  const aliasTokens: AliasTokens = {
    "primary-light": mapTokens["primary-400"],
    "primary-text": mapTokens["primary-300"],
    background: mapTokens["neutral-900"],
    "surface-1": mapTokens["neutral-800"],
    "surface-2": mapTokens["neutral-700"],
    "surface-3": mapTokens["neutral-600"],
    "text-placeholder": mapTokens["neutral-400"],
    "text-subtle": mapTokens["neutral-300"],
  };

  return aliasTokens;
};
