import { RuleType } from "types";

export const PREMIUM_RULE_TYPES = [RuleType.RESPONSE, RuleType.REQUEST, RuleType.SCRIPT];

export const RULE_IMPORT_TYPE = {
  OVERWRITE: "overwrite",
  DUPLICATE: "duplicate",
};

export const RULE_KEYBOARD_SHORTCUTS: Record<
  string,
  {
    hotKey: string;
    displayText?: string;
    description: string;
  }
> = {
  EDITOR_BACK: {
    hotKey: "esc",
    displayText: "ESC",
    description: "From editor to rules list",
  },
  SAVE_RULE: {
    hotKey: "meta+s",
    description: "Save rule",
  },
};
