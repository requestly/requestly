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
  | "black-t-20";

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
  "neutral-0": "#E9E9E9",
  "neutral-100": "#E9E9E9",
  "neutral-200": "#D1D1D1",
  "neutral-300": "#BBBBBB",
  "neutral-400": "#8F8F8F",
  "neutral-500": "#787878",
  "neutral-600": "#5C5C5C",
  "neutral-700": "#383838",
  "neutral-800": "#282828",
  "neutral-900": "#212121",
  "neutral-1000": "#1A1A1A",
  "neutral-1100": "#141414",
  "success-0": "#A6E9C8",
  "success-100": "#A6E9C8",
  "success-200": "#6FDAA6",
  "success-300": "#4DCC8F",
  "success-400": "#28C07A",
  "success-500": "#0BAA60",
  "success-600": "#0A9C55",
  "success-700": "#0C7844",
  "success-800": "#104B2F",
  "success-900": "#00210e",
  "success-1000": "#0D1F11",
  "error-0": "#FFC7C7",
  "error-100": "#FFC7C7",
  "error-200": "#FFA7A7",
  "error-300": "#FF8080",
  "error-400": "#F95E5E",
  "error-500": "#dc2626",
  "error-600": "#CF2A2A",
  "error-700": "#A41F1F",
  "error-800": "#591A1A",
  "error-900": "#2f0404",
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
  "warning-900": "#2e1b00",
  "warning-1000": "#27170B",
};

export const generateColorTokens = (
  primary = "#004EEB",
  secondary = "#680cb7",
  neutral = "#787878",
  success = "#0BAA60",
  error = "#dc2626",
  warning = "#E09400"
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
    "white-t-10": "#FFFFFF19",
    "white-t-20": "#FFFFFF33",
    black: "#0E0E0E",
    "black-t-70": "#000000B3",
    "black-t-20": "#00000033",
  };

  return aliasTokens;
};
