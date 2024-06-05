import React, { useCallback, useEffect, useMemo, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorLanguage } from "componentsV2/CodeEditor/types";
import { ResizableBox } from "react-resizable";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getAllEditorToast } from "store/selectors";
import { EditorToastContainer } from "../EditorToast/EditorToastContainer";
import "./editor.scss";

interface EditorProps {
  value: string;
  defaultValue: string;
  language: EditorLanguage;
  isReadOnly?: boolean;
  height?: number;
  isResizable?: boolean;
  unlockJsonPrettify?: boolean;
  isCodeMinified: boolean;
  isCodeFormatted?: boolean;
  id?: string;
  handleChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  value,
  defaultValue,
  language,
  unlockJsonPrettify = false,
  isCodeMinified,
  isCodeFormatted,
  isReadOnly = false,
  height = 225,
  isResizable = false,
  handleChange,
  id = "",
}) => {
  const dispatch = useDispatch();
  const [editorHeight, setEditorHeight] = useState(height);
  const [editorContent, setEditorContent] = useState(value);

  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[id], [allEditorToast, id]); // todo: rename

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

  const handleCodePrettify = useCallback(
    (parser: string) => {
      try {
        let prettifiedCode = prettier.format(value, {
          parser: parser,
          plugins: [parserBabel],
        });
        setEditorContent(prettifiedCode);
      } catch (error) {
        console.error("Error while prettifying code", error);
      }
    },
    [value]
  );

  useEffect(() => {
    if (isCodeFormatted) {
      if (language === "javascript") {
        handleCodePrettify("babel");
      } else if (unlockJsonPrettify && language === "json") {
        !isCodeMinified && handleCodePrettify(EditorLanguage.JSON);
      }
    }
  }, [isCodeMinified, isCodeFormatted, language, unlockJsonPrettify, handleCodePrettify]);

  useEffect(() => {
    if (isCodeMinified && language === "json") {
      setEditorContent(value);
    }
  }, [isCodeMinified, language, value]);

  const handleEditorClose = useCallback(
    (id: string) => {
      // @ts-ignore
      dispatch(actions.removeToastForEditor({ id }));
    },
    [dispatch]
  );

  const handleEditorBodyChange = useCallback(
    (value: string) => {
      setEditorContent(value);
      handleChange(value);
    },
    [handleChange]
  );

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
      <>
        {toastOverlay && (
          <EditorToastContainer
            message={toastOverlay.message}
            type={toastOverlay.type}
            onClose={() => handleEditorClose(toastOverlay.id)}
            isVisible={toastOverlay}
            autoClose={toastOverlay.autoClose}
          />
        )}
        <CodeMirror
          className="code-editor"
          width="100%"
          readOnly={isReadOnly}
          value={editorContent ?? ""}
          defaultValue={defaultValue ?? ""}
          onChange={handleEditorBodyChange}
          theme={vscodeDark}
          extensions={[editorLanguage, EditorView.lineWrapping]}
          basicSetup={{
            highlightActiveLine: false,
            bracketMatching: true,
            closeBrackets: true,
            allowMultipleSelections: true,
          }}
        />
      </>
    </ResizableBox>
  );
};

export default Editor;
