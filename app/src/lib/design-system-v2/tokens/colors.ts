type SeedTokenKeys = "primary" | "secondary" | "neutral" | "success" | "error" | "warning";
type MapTokenVariations = 0 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
type MapTokenKeys = `${SeedTokenKeys}-${MapTokenVariations}` | "neutral-1100"; // Temp for neutral
type AliasTokenKeys =
  | "background"
  | "background-dark"
  | "primary-darker"
  | "primary-dark"
  | "primary-soft"
  | "primary-text"
  | "surface-0"
  | "surface-1"
  | "surface-2"
  | "surface-3"
  | "success-darker"
  | "success-text"
  | "text-placeholder"
  | "text-subtle"
  | "text-default"
  | "error-darker"
  | "error-dark"
  | "error-soft"
  | "error-text"
  | "warning-darker"
  | "warning-dark"
  | "warning-soft"
  | "warning-text"
  | "white-t-10"
  | "white"
  | "white-t-20"
  | "black"
  | "black-t-70"
  | "black-t-20"
  | "error"
  | "primary"
  | "success"
  | "warning"
  | "white";

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
  "primary-0": "#cbe2fe",
  "primary-100": "#cbe2fe",
  "primary-200": "#97c3fd",
  "primary-300": "#639ff9",
  "primary-400": "#3c7ff3",
  "primary-500": "#004eeb",
  "primary-600": "#003cca",
  "primary-700": "#002ca9",
  "primary-800": "#001f88",
  "primary-900": "#001670",
  "primary-1000": "#111a2c",
  "secondary-0": "#e3dbf6",
  "secondary-100": "#c8b7ec",
  "secondary-200": "#ae93e0",
  "secondary-300": "#956fd4",
  "secondary-400": "#7e48c6",
  "secondary-500": "#680cb7",
  "secondary-600": "#50078f",
  "secondary-700": "#390469",
  "secondary-800": "#240245",
  "secondary-900": "#100024",
  "secondary-1000": "#020007",
  "neutral-0": "#e9e9e9",
  "neutral-100": "#e9e9e9",
  "neutral-200": "#d1d1d1",
  "neutral-300": "#bbbbbb",
  "neutral-400": "#8f8f8f",
  "neutral-500": "#787878",
  "neutral-600": "#5c5c5c",
  "neutral-700": "#383838",
  "neutral-800": "#282828",
  "neutral-900": "#212121",
  "neutral-1000": "#1a1a1a",
  "neutral-1100": "#141414",
  "success-0": "#a6e9c8",
  "success-100": "#a6e9c8",
  "success-200": "#6fdaa6",
  "success-300": "#4dcc8f",
  "success-400": "#28c07a",
  "success-500": "#0baa60",
  "success-600": "#0a9c55",
  "success-700": "#0c7844",
  "success-800": "#104b2f",
  "success-900": "#00210e",
  "success-1000": "#0d1f11",
  "error-0": "#ffc7c7",
  "error-100": "#ffc7c7",
  "error-200": "#ffa7a7",
  "error-300": "#ff8080",
  "error-400": "#f95e5e",
  "error-500": "#dc2626",
  "error-600": "#cf2a2a",
  "error-700": "#a41f1f",
  "error-800": "#591a1a",
  "error-900": "#2f0404",
  "error-1000": "#271111",
  "warning-0": "#ffdd86",
  "warning-100": "#ffdd86",
  "warning-200": "#ffcb45",
  "warning-300": "#fdba0f",
  "warning-400": "#f2aa09",
  "warning-500": "#e09400",
  "warning-600": "#d07d00",
  "warning-700": "#b55e0f",
  "warning-800": "#5c3111",
  "warning-900": "#2e1b00",
  "warning-1000": "#27170b",
};

export const generateColorTokens = (
  primary = "#004eeb",
  secondary = "#680cb7",
  neutral = "#787878",
  success = "#0baa60",
  error = "#dc2626",
  warning = "#e09400"
) => {
  const seedTokens = { primary, secondary, neutral, success, error, warning };
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
    background: mapTokens["neutral-1000"],
    "background-dark": mapTokens["neutral-1100"],
    "primary-darker": mapTokens["primary-900"],
    "primary-dark": mapTokens["primary-700"],
    "primary-soft": mapTokens["primary-400"],
    "primary-text": mapTokens["primary-300"],
    "surface-0": mapTokens["neutral-900"],
    "surface-1": mapTokens["neutral-800"],
    "surface-2": mapTokens["neutral-700"],
    "surface-3": mapTokens["neutral-600"],
    "text-placeholder": mapTokens["neutral-400"],
    "text-subtle": mapTokens["neutral-300"],
    "text-default": "#FFFFFF", // This needs to be generated depending upon neutral color. Light in case of dark and dark in case of light
    "error-darker": mapTokens["error-800"],
    "error-dark": mapTokens["error-700"],
    "error-soft": mapTokens["error-400"],
    "error-text": mapTokens["error-300"],
    "warning-darker": mapTokens["warning-800"],
    "warning-dark": mapTokens["warning-700"],
    "warning-soft": mapTokens["warning-400"],
    "warning-text": mapTokens["warning-200"],
    "success-darker": mapTokens["success-800"],
    "success-text": mapTokens["success-200"],

    // Hardcoded Colors
    white: "#FFFFFF",
    "white-t-10": "#FFFFFF0F",
    "white-t-20": "#FFFFFF1F",
    black: "#000000",
    "black-t-70": "#000000B2",
    "black-t-20": "#00000033",

    // Additional Color Aliases
    error: mapTokens["error-500"],
    primary: mapTokens["primary-500"],
    success: mapTokens["success-500"],
    warning: mapTokens["warning-500"],
  };

  return aliasTokens;
};
