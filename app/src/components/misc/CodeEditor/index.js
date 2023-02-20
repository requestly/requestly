import { useState, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { getAppTheme } from "store/selectors";

//utils
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { ResizableBox } from "react-resizable";

import "./CodeEditor.css";

// https://github.com/suren-atoyan/monaco-react#use-monaco-editor-as-an-npm-package
loader.config({
  monaco,
});

const CodeEditor = ({
  height = 275,
  language,
  defaultValue,
  value,
  readOnly,
  handleChange,
  unlockCodePrettify,
  isCodeMinified,
  isJSPrettified,
  validation = "editable",
}) => {
  const appTheme = useSelector(getAppTheme);
  const editorRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [isEditorMount, setIsEditorMount] = useState(false);

  const handleCodePrettify = (parser) => {
    const code = editorRef.current.getModel().getValue();
    try {
      let prettifiedCode = prettier.format(code, {
        parser: parser,
        plugins: [parserBabel],
      });
      editorRef.current.setValue(prettifiedCode);
    } catch {
      editorRef.current.setValue(code);
    }
  };

  const handleEditordidMount = (editor) => {
    editorRef.current = editor;

    if (!value.length) {
      handleChange(defaultValue ? defaultValue : ""); //trigger handleChange for defaultValue in code editor
    }
  };

  const handleResize = (event, { element, size, handle }) => {
    setEditorHeight(size.height);
  };

  useEffect(() => {
    loader.init().then((module) => module && setIsEditorMount(true));
  }, []);

  useEffect(() => {
    if (editorRef && unlockCodePrettify) {
      if (!isCodeMinified && language === "json") {
        handleCodePrettify("json");
      }
    }
  }, [isCodeMinified, language, unlockCodePrettify]);

  useEffect(() => {
    if (isJSPrettified) {
      if (language === "javascript" && editorRef) {
        handleCodePrettify("babel");
      }
    }
  }, [isJSPrettified, language]);

  return (
    <>
      {isEditorMount && (
        <ResizableBox
          height={editorHeight}
          width={Infinity}
          onResize={handleResize}
          handle={<div className="custom-handle"></div>}
          axis="y"
          style={{
            minHeight: `${height}px`,
            marginBottom: "1.5rem",
          }}
        >
          <Editor
            width="100%"
            key={language}
            language={language}
            theme={appTheme === "dark" ? "vs-dark" : "vs"}
            defaultValue={defaultValue}
            value={value}
            onChange={handleChange}
            onMount={handleEditordidMount}
            options={{
              minimap: {
                enabled: false,
              },
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
              fontSize: 13,
              readOnly: readOnly,
              cursorSmoothCaretAnimation: true,
              cursorBlinking: "smooth",
              selectionHighlight: true,
              renderValidationDecorations: validation,
              wordWrap: isCodeMinified && language === "json" ? "on" : "off",
              automaticLayout: true,
              formatOnType: false,
              formatOnPaste: false,
              scrollBeyondLastLine: false,
              scrollBeyondLastColumn: 0,
              extraEditorClassName: "code-editor",
            }}
          />
        </ResizableBox>
      )}
    </>
  );
};

export default CodeEditor;
