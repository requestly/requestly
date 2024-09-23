import { RuleType } from "types";

export const PREMIUM_RULE_TYPES = [RuleType.RESPONSE, RuleType.REQUEST, RuleType.SCRIPT];

export const RULE_IMPORT_TYPE = {
  OVERWRITE: "overwrite",
  DUPLICATE: "duplicate",
};

export const RULE_KEYBOARD_SHORTCUTS = {
  EDITOR_BACK: {
    hotKey: "esc",
    description: "From editor to rules list",
  },
};
