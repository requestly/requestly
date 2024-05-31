import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { abcdef } from "@uiw/codemirror-theme-abcdef";

//utils
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { ResizableBox } from "react-resizable";

import "./editor.css";
import "../EditorToast/editorToast.scss";
import { EditorToastContainer } from "../EditorToast/EditorToastContainer";
import { getAllEditorToast } from "store/selectors";
import { useDispatch } from "react-redux";
import { actions } from "store";

/**
 * Editor id is used to match the exact editor instance for showing the editor toast
 *
 * in case of rules. id is `pair.id` (script id in case of script rule)
 * while creating the rules. id is `temp-${rule.type}-rule` // HACKY
 * in case of mocks. id is `${mock.id}`
 */

const Editor = ({
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
  const dispatch = useDispatch();
  const [editorHeight, setEditorHeight] = useState(height);
  const [editorContent, setEditorContent] = useState(value);
  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[id], [allEditorToast, id]); // todo: rename

  const handleCodePrettify = useCallback(
    (parser) => {
      try {
        let prettifiedCode = prettier.format(value, {
          parser: parser,
          plugins: [parserBabel],
        });
        setEditorContent(prettifiedCode);
      } catch {
        setEditorContent(value);
      }
    },
    [value]
  );

  // const handleEditorDidMount = (editor) => {
  //   editorRef.current = editor;

  //   if (!value?.length) {
  //     handleChange(defaultValue ? defaultValue : ""); //trigger handleChange for defaultValue in code editor
  //   }
  // };

  const handleResize = (event, { element, size, handle }) => {
    setEditorHeight(size.height);
  };

  // useEffect(() => {
  //   loader.init().then((module) => module && setIsEditorMount(true));
  //   return () => {
  //     setIsEditorMount(false);
  //   };
  // }, [id]);

  useEffect(() => {
    if (isCodeFormatted) {
      if (language === "javascript") {
        handleCodePrettify("babel");
      } else if (unlockJsonPrettify && language === "json") {
        !isCodeMinified && handleCodePrettify("json");
      }
    }
  }, [isCodeMinified, isCodeFormatted, language, unlockJsonPrettify, handleCodePrettify]);

  const handleEditorClose = useCallback(
    (id) => {
      dispatch(actions.removeToastForEditor({ id }));
    },
    [dispatch]
  );

  return (
    <>
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
        <>
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
          <CodeMirror
            className="code-editor"
            width="100%"
            value={editorContent}
            defaultValue={defaultValue}
            onChange={handleChange}
            theme={abcdef}
            extensions={[javascript({ jsx: false }), EditorView.lineWrapping]}
            basicSetup={{
              highlightActiveLine: false,
              lineNumbers: false,
              foldGutter: false,
              wrapLines: true,
              bracketMatching: true,
              closeBrackets: true,
              lineWrapping: true,
            }}
          />
          {/* <Editor
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
            /> */}
        </>
      </ResizableBox>
    </>
  );
};

export default Editor;
