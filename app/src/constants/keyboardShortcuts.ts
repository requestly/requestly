export enum Feature {
  RULES = "RULES",
  API_CLIENT = "API_CLIENT",
  FILE_SERVER = "FILE_SERVER",
}

export const KEY_ICONS: Record<string, string> = {
  meta: "⌘",
  enter: "⏎",
};

export type KEYBOARD_SHORTCUT = {
  hotKey: string;
  description: string;
};

export const KEYBOARD_SHORTCUTS: Record<Feature, Record<string, KEYBOARD_SHORTCUT>> = {
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
  [Feature.FILE_SERVER]: {
    SAVE_FILE: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save file",
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
    SAVE_ENVIRONMENT: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save environment",
    },
    SAVE_COLLECTION: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save collection",
    },
    SAVE_RUNTIME_VARIABLES: {
      hotKey: navigator.platform.match("Mac") ? "meta+s" : "ctrl+s",
      description: "Save runtime variables",
    },
    CLOSE_ACTIVE_TAB_DESKTOP: {
      hotKey: navigator.platform.match("Mac") ? "meta+w" : "ctrl+w",
      description: "Close active tab",
    },
    CLOSE_ACTIVE_TAB_EXTENSION: {
      hotKey: navigator.platform.match("Mac") ? "meta+alt+w" : "ctrl+alt+w",
      description: "Close active tab",
    },
  },
};
