import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { getAppTheme } from "store/selectors";

//utils
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { ResizableBox } from "react-resizable";

import "./CodeEditor.css";
import "./EditorToast/editorToast.scss";
import { EditorToastContainer } from "./EditorToast/EditorToastContainer";
import { getAllEditorToast } from "store/selectors";
import { useDispatch } from "react-redux";
import { actions } from "store";

// https://github.com/suren-atoyan/monaco-react#use-monaco-editor-as-an-npm-package
loader.config({
  monaco,
});

/**
 * Editor id is used to match the exact editor instance for showing the editor toast
 *
 * in case of rules. id is `pair.id`
 * while creating the rules. id is `temp-${rule.type}-rule` // HACKY
 * in case of mocks. id is `${mock.id}`
 */

const CodeEditor = ({
  height = 275,
  language,
  defaultValue,
  value,
  readOnly,
  handleChange,
  unlockJsonPrettify,
  isCodeMinified,
  isCodeFormatted,
  validation = "editable",
  isResizable = true,
  id = "",
}) => {
  const appTheme = useSelector(getAppTheme);
  const editorRef = useRef(null);
  const dispatch = useDispatch();
  const [editorHeight, setEditorHeight] = useState(height);
  const [isEditorMount, setIsEditorMount] = useState(false);

  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[id], [allEditorToast, id]); // todo: rename

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

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    if (!value?.length) {
      handleChange(defaultValue ? defaultValue : ""); //trigger handleChange for defaultValue in code editor
    }
  };

  const handleResize = (event, { element, size, handle }) => {
    setEditorHeight(size.height);
  };

  useEffect(() => {
    loader.init().then((module) => module && setIsEditorMount(true));
    return () => {
      setIsEditorMount(false);
    };
  }, [id]);

  useEffect(() => {
    if (editorRef && isCodeFormatted) {
      if (language === "javascript") {
        handleCodePrettify("babel");
      } else if (unlockJsonPrettify && language === "json") {
        !isCodeMinified && handleCodePrettify("json");
      }
    }
  }, [isCodeMinified, isCodeFormatted, language, unlockJsonPrettify]);

  const handleEditorClose = useCallback(
    (id) => {
      dispatch(actions.removeToastForEditor({ id }));
    },
    [dispatch]
  );

  return (
    <>
      {isEditorMount && (
        <ResizableBox
          height={editorHeight}
          width={Infinity}
          onResize={handleResize}
          handle={isResizable ? <div className="custom-handle" /> : null}
          axis="y"
          style={{
            minHeight: `${height}px`,
            marginBottom: "1.5rem",
          }}
        >
          {toastOverlay && (
            <EditorToastContainer
              message={toastOverlay.message}
              type={toastOverlay.type}
              id={toastOverlay.id}
              onClose={() => handleEditorClose(toastOverlay.id)}
              isVisible={toastOverlay}
              autoClose={toastOverlay.autoClose}
            />
          )}
          <Editor
            width="100%"
            key={language}
            language={language}
            theme={appTheme === "dark" ? "vs-dark" : "vs"}
            defaultValue={defaultValue}
            value={value}
            onChange={handleChange}
            onMount={handleEditorDidMount}
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
