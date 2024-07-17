import { theme } from "lib/design-system-v2";

export const REQUEST_METHOD_COLORS = {
  GET: theme.colors["success-300"],
  POST: theme.colors["warning-300"],
  PUT: theme.colors["primary-300"],
  PATCH: theme.colors["secondary-300"],
  DELETE: theme.colors["error-300"],
  HEAD: theme.colors["success-100"],
  OPTIONS: theme.colors["warning-100"],
};

export type RequestMethod = keyof typeof REQUEST_METHOD_COLORS;
