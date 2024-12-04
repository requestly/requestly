enum Feature {
  RULES = "RULES",
  API_CLIENT = "API_CLIENT",
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
  [Feature.API_CLIENT]: {
    SEND_REQUEST: {
      hotKey: navigator.platform.match("Mac") ? "meta+enter" : "ctrl+enter",
      description: "Send request",
    },
    SAVE_REQUEST: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save request",
    },
  },
};
