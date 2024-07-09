import { generateColorTokens } from "lib/design-system-v2/tokens/colors";

const tokens = generateColorTokens("#004EEB", "A447F8", "#787878", "#0BAA60", "#E43434", "#E09400");

export const REQUEST_METHOD_COLORS = {
  GET: tokens["success-300"],
  POST: tokens["warning-300"],
  PUT: tokens["primary-300"],
  PATCH: tokens["secondary-300"],
  DELETE: tokens["error-300"],
  HEAD: tokens["success-100"],
  OPTIONS: tokens["warning-100"],
};
