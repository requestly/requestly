import React from "react";
import { KEY_ICONS, KEYBOARD_SHORTCUT, KEYBOARD_SHORTCUTS } from "../../../../../../../../../constants";
import { capitalize } from "lodash";
import "./placeholderKeyboardShortcuts.scss";

const KeyboardShortcut: React.FC<KEYBOARD_SHORTCUT> = ({ hotKey, description }) => {
  return (
    <div className="keyboard-shortcut">
      <div className="description">{description}</div>
      <div className="keys-container">
        {hotKey.split("+").map((key) => (
          <span className="key">{KEY_ICONS[key] ?? capitalize(key)}</span>
        ))}
      </div>
    </div>
  );
};

export const PlaceholderKeyboardShortcuts: React.FC<{}> = () => {
  return (
    <div className="api-client-placeholder-keyboard-shortcuts">
      <KeyboardShortcut {...KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST} />
      <KeyboardShortcut {...KEYBOARD_SHORTCUTS.API_CLIENT.SEND_REQUEST} />
    </div>
  );
};
