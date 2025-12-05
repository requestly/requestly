import React, { useMemo } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { unifiedMergeView } from "@codemirror/merge";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { customKeyBinding } from "componentsV2/CodeEditor/components/EditorV2/plugins";
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
