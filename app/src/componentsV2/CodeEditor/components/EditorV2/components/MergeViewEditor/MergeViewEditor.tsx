import React, { useMemo } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { unifiedMergeView } from "@codemirror/merge";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import "./mergeViewEditor.scss";

interface Props {
  originalValue: string;
  newValue: string;
}

export const MergeViewEditor: React.FC<Props> = ({ originalValue, newValue }) => {
  const mergeViewExtension = useMemo(() => {
    return unifiedMergeView({
      original: originalValue,
    });
  }, [originalValue]);

  const customKeyBinding = useMemo(
    () =>
      Prec.highest(
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
      ),
    []
  );

  return (
    <CodeMirror
      className="code-editor merge-view-editor"
      readOnly
      value={newValue}
      extensions={[mergeViewExtension, javascript({ jsx: false }), customKeyBinding, EditorView.lineWrapping]}
      basicSetup={{
        highlightActiveLine: false,
        bracketMatching: true,
        closeBrackets: true,
        allowMultipleSelections: true,
      }}
      theme={vscodeDark}
      data-enable-grammarly="false"
      data-gramm_editor="false"
      data-gramm="false"
    />
  );
};
