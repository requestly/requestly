import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

/**
 * Custom keyboard bindings for CodeMirror editors
 * - Mod-s (Cmd+S on Mac, Ctrl+S on Windows/Linux): Dispatches save keyboard event
 * - Mod-Enter: Dispatches enter keyboard event for executing queries
 * Uses highest precedence (Prec.highest) to ensure these bindings take priority
 */
const customKeyBinding = Prec.highest(
  keymap.of([
    {
      key: "Mod-s",
      run: (view) => {
        const event = new KeyboardEvent("keydown", {
          key: "s",
          metaKey: navigator.platform.includes("Mac"),
          ctrlKey: !navigator.platform.includes("Mac"),
          bubbles: true,
          cancelable: true,
        });
        view.dom.dispatchEvent(event);
        return true;
      },
    },
    {
      key: "Mod-Enter",
      run: (view) => {
        const event = new KeyboardEvent("keydown", {
          key: "Enter",
          metaKey: navigator.platform.includes("Mac"),
          ctrlKey: !navigator.platform.includes("Mac"),
          bubbles: true,
          cancelable: true,
        });
        view.dom.dispatchEvent(event);
        return true;
      },
    },
  ])
);

export default customKeyBinding;
