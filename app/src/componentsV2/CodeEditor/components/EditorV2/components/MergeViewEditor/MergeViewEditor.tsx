import React, { useMemo, useRef } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { unifiedMergeView } from "@codemirror/merge";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { customKeyBinding } from "componentsV2/CodeEditor/components/EditorV2/plugins";
import "./mergeViewEditor.scss";

interface Props {
  originalValue: string;
  newValue: string;
  onMergeChunk: (mergedValue: string) => void;
}

export const MergeViewEditor: React.FC<Props> = ({ originalValue, newValue, onMergeChunk }) => {
  const viewRef = useRef<EditorView | null>(null);

  const mergeViewExtension = useMemo(() => {
    return unifiedMergeView({
      original: originalValue,
      mergeControls: (type, action) => {
        const button = document.createElement("button");
        button.className = `merge-view-chunk-button ${
          type === "accept" ? "merge-view-chunk-button__accept" : "merge-view-chunk-button__reject"
        }`;
        button.textContent = type === "accept" ? "Accept" : "Reject";
        button.onclick = (e) => {
          action(e);
          const view = viewRef.current;
          if (!view) return;
          const mergedValue = view.state.doc.toString();
          onMergeChunk(mergedValue);
        };
        return button;
      },
    });
  }, [originalValue, onMergeChunk]);

  return (
    <CodeMirror
      className="code-editor merge-view-editor"
      value={newValue}
      onCreateEditor={(view) => {
        viewRef.current = view;
      }}
      readOnly
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
