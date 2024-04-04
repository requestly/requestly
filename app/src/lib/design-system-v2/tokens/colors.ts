type SeedTokenKeys = "primary" | "neutral" | "success" | "error" | "warning";
type MapTokenVariations = 0 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
type MapTokenKeys = `${SeedTokenKeys}-${MapTokenVariations}`;
type AliasTokenKeys =
  | "primary-light"
  | "primary-text"
  | "background"
  | "surface-05"
  | "surface-1"
  | "surface-2"
  | "surface-3"
  | "text-placeholder"
  | "text-subtle"
  | "text-default"
  | "error-light"
  | "error-text"
  | "warning-light"
  | "white-t-10"
  | "white"
  | "white-t-20"
  | "black"
  | "black-t-70";

export type SeedTokens = {
  [key in SeedTokenKeys]: string;
};

export type MapTokens = {
  [key in MapTokenKeys]: string;
};

export type AliasTokens = {
  [key in AliasTokenKeys]: string;
};

export type ColorTokens = SeedTokens & MapTokens & AliasTokens;

const DEFAULT_MAP_TOKENS: MapTokens = {
  "primary-0": "#CBE2FE",
  "primary-100": "#CBE2FE",
  "primary-200": "#97C3FD",
  "primary-300": "#639FF9",
  "primary-400": "#3C7FF3",
  "primary-500": "#004EEB",
  "primary-600": "#003CCA",
  "primary-700": "#002CA9",
  "primary-800": "#001F88",
  "primary-900": "#001670",
  "primary-1000": "#111A2C",
  "neutral-0": "#E9E9E9",
  "neutral-100": "#E9E9E9",
  "neutral-200": "#D1D1D1",
  "neutral-300": "#BBBBBB",
  "neutral-400": "#8F8F8F",
  "neutral-500": "#787878",
  "neutral-600": "#5C5C5C",
  "neutral-700": "#383838",
  "neutral-800": "#282828",
  "neutral-900": "#1A1A1A",
  "neutral-1000": "#1A1A1A",
  "success-0": "#A6E9C8",
  "success-100": "#A6E9C8",
  "success-200": "#6FDAA6",
  "success-300": "#4DCC8F",
  "success-400": "#28C07A",
  "success-500": "#0BAA60",
  "success-600": "#0A9C55",
  "success-700": "#0C7844",
  "success-800": "#104B2F",
  "success-900": "#0D1F11",
  "success-1000": "#0D1F11",
  "error-0": "#FFC7C7",
  "error-100": "#FFC7C7",
  "error-200": "#FFA7A7",
  "error-300": "#FF8080",
  "error-400": "#F95E5E",
  "error-500": "#E43434",
  "error-600": "#CF2A2A",
  "error-700": "#A41F1F",
  "error-800": "#591A1A",
  "error-900": "#271111",
  "error-1000": "#271111",
  "warning-0": "#FFDD86",
  "warning-100": "#FFDD86",
  "warning-200": "#FFCB45",
  "warning-300": "#FDBA0F",
  "warning-400": "#F2AA09",
  "warning-500": "#E09400",
  "warning-600": "#D07D00",
  "warning-700": "#B55E0F",
  "warning-800": "#5C3111",
  "warning-900": "#27170B",
  "warning-1000": "#27170B",
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
  const aliasTokens = generateAliasTokens(mapTokens);

  return {
    ...seedTokens,
    ...mapTokens,
    ...aliasTokens,
  };
};

const generateMapTokens = (seedTokens: SeedTokens) => {
  let mapTokens: MapTokens = {} as MapTokens;
  mapTokens = DEFAULT_MAP_TOKENS;

  // TODO: @wrongsahil - Add color pallette generation code here. https://linear.app/requestly/issue/ENGG-1572/
  // Object.entries(seedTokens).forEach(([key, value]) => {
  //   generate(value).forEach((color, index) => {
  //     mapTokens[`${key}-${index * 100}` as MapTokenKeys] = color;
  //   });
  // });

  return mapTokens;
};

const generateAliasTokens = (mapTokens: MapTokens) => {
  const aliasTokens: AliasTokens = {
    // Generated from Map Tokens
    "primary-light": mapTokens["primary-400"],
    "primary-text": mapTokens["primary-300"],
    background: mapTokens["neutral-900"],
    "surface-05": "#212121", // TODO: @vijay needs to link this with a map token
    "surface-1": mapTokens["neutral-800"],
    "surface-2": mapTokens["neutral-700"],
    "surface-3": mapTokens["neutral-600"],
    "text-placeholder": mapTokens["neutral-400"],
    "text-subtle": mapTokens["neutral-300"],
    "text-default": "#FFFFFF", // TODO: @vijay needs to link this with a map token,
    "error-light": mapTokens["error-400"],
    "error-text": mapTokens["error-300"],
    "warning-light": mapTokens["warning-400"],

    // Hardcoded Colors
    "white-t-10": "#FFFFFF19",
    white: "#FFFFFF",
    "white-t-20": "#FFFFFF33",
    black: "#0E0E0E",
    "black-t-70": "000000B2",
  };

  return aliasTokens;
};
