enum Feature {
  RULES = "RULES",
}

export const KEY_ICONS: Record<string, string> = {
  meta: "⌘",
};

export const KEYBOARD_SHORTCUTS: Record<
  Feature,
  Record<
    string,
    {
      hotKey: string;
      description: string;
    }
  >
> = {
  [Feature.RULES]: {
    EDITOR_BACK: {
      hotKey: "esc",
      description: "From editor to rules list",
    },
    SAVE_RULE: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save rule",
    },
  },
};
