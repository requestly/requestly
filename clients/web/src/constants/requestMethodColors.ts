import { theme } from "lib/design-system-v2";

export const REQUEST_METHOD_COLORS = {
  GET: theme.colors["success-300"],
  POST: theme.colors["warning-300"],
  PUT: theme.colors["primary-300"],
  PATCH: theme.colors["secondary-300"],
  DELETE: theme.colors["error-300"],

  // custom color
  HEAD: "#5FD7DE",
  OPTIONS: "#F335EC",
};

// Same colors as above, but with 12% opacity
export const REQUEST_METHOD_BACKGROUND_COLORS = {
  GET: "rgba(77, 204, 143, 0.12)",
  POST: "rgba(253, 186, 15, 0.12)",
  PUT: "rgba(99, 159, 249, 0.12)",
  PATCH: "rgba(198, 134, 250, 0.12)",
  DELETE: "rgba(255, 128, 128, 0.12)",
  HEAD: "rgba(95, 215, 222, 0.12)",
  OPTIONS: "rgba(243, 53, 236, 0.12)",
};

export type RequestMethod = keyof typeof REQUEST_METHOD_COLORS;
