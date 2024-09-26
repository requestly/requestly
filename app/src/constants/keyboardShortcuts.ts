enum Feature {
  RULES = "RULES",
}

export const KEYBOARD_SHORTCUTS: Record<
  Feature,
  Record<
    string,
    {
      hotKey: string;
      displayText?: string;
      description: string;
    }
  >
> = {
  [Feature.RULES]: {
    EDITOR_BACK: {
      hotKey: "esc",
      displayText: "ESC",
      description: "From editor to rules list",
    },
    SAVE_RULE: {
      hotKey: "meta+s",
      description: "Save rule",
      displayText: navigator.platform.match("Mac") ? "⌘+s" : "ctrl+s",
    },
  },
};
