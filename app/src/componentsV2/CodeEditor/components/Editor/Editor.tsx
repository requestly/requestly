import React, { useMemo, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorLanguage } from "componentsV2/CodeEditor/types";
import { ResizableBox } from "react-resizable";
import "./editor.scss";

interface EditorProps {
  value: string;
  defaultValue: string;
  language: EditorLanguage;
  isReadOnly?: boolean;
  height?: number;
  isResizable?: boolean;
  handleChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  value,
  defaultValue,
  language,
  isReadOnly = false,
  height = 225,
  isResizable = false,
  handleChange,
}) => {
  const [editorHeight, setEditorHeight] = useState(height);
  const [editorContent, setEditorContent] = useState(value);

  const handleResize = (event: any, { element, size, handle }: any) => {
    setEditorHeight(size.height);
  };

  const editorLanguage = useMemo(() => {
    switch (language) {
      case EditorLanguage.JAVASCRIPT:
        return javascript({ jsx: false });
      case EditorLanguage.JSON:
        return json();
      case EditorLanguage.HTML:
        return html();
      case EditorLanguage.CSS:
        return css();
      default:
        return javascript({ jsx: false });
    }
  }, [language]);

  console.log("EditorProps", editorContent, value);

  return (
    <ResizableBox
      height={editorHeight}
      width={Infinity}
      onResize={handleResize}
      handle={isResizable ? <div className="custom-handle" /> : null}
      axis="y"
      style={{
        minHeight: `${height}px`,
        marginBottom: isResizable ? "25px" : 0,
      }}
    >
      <CodeMirror
        className="code-editor"
        width="100%"
        readOnly={isReadOnly}
        //   height="calc(100vh - 48px - 95px - 174px - 74px - 150px )"
        value={editorContent ?? ""}
        defaultValue={defaultValue ?? ""}
        onChange={handleChange}
        theme={vscodeDark}
        extensions={[editorLanguage, EditorView.lineWrapping]}
        basicSetup={{
          highlightActiveLine: false,
          bracketMatching: true,
          closeBrackets: true,
          allowMultipleSelections: true,
        }}
      />
    </ResizableBox>
  );
};

export default Editor;
