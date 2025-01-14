import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, { EditorView, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorLanguage, EditorCustomToolbar, AnalyticEventProperties } from "componentsV2/CodeEditor/types";
import { ResizableBox } from "react-resizable";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAllEditorToast, getIsCodeEditorFullScreenModeOnboardingCompleted } from "store/selectors";
import { EditorToastContainer } from "../EditorToast/EditorToastContainer";
import { getByteSize } from "utils/FormattingHelper";
import CodeEditorToolbar from "./components/Toolbar/Toolbar";
import { Modal } from "antd";
import { toast } from "utils/Toast";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { trackCodeEditorCollapsedClick, trackCodeEditorExpandedClick } from "../analytics";
import { EnvironmentVariables } from "backend/environment/types";
import { highlightVariablesPlugin } from "features/apiClient/screens/environment/components/SingleLineEditor/plugins/highlightVariables";
import { EditorPopover } from "./components/PopOver";
import "./editor.scss";
import { prettifyCode } from "componentsV2/CodeEditor/utils";
import "./components/PopOver/popover.scss";
import { useDebounce } from "hooks/useDebounce";
interface EditorProps {
  value: string;
  language: EditorLanguage | null;
  isReadOnly?: boolean;
  height?: number;
  isResizable?: boolean;
  id?: string;
  toolbarOptions?: EditorCustomToolbar;
  hideCharacterCount?: boolean;
  handleChange?: (value: string) => void;
  analyticEventProperties?: AnalyticEventProperties;
  prettifyOnInit?: boolean;
  envVariables?: EnvironmentVariables;
  config?: {
    enablePrettify?: boolean;
  };
}

const Editor: React.FC<EditorProps> = ({
  value,
  language,
  isReadOnly = false,
  height = 225,
  isResizable = false,
  hideCharacterCount = false,
  handleChange = () => {},
  toolbarOptions,
  id = "",
  analyticEventProperties = {},
  prettifyOnInit = false,
  envVariables,
  config = { enablePrettify: true },
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hoveredVariable, setHoveredVariable] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const isFullScreenModeOnboardingCompleted = useSelector(getIsCodeEditorFullScreenModeOnboardingCompleted);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[id], [allEditorToast, id]); // todo: rename
  const [isCodePrettified, setIsCodePrettified] = useState(prettifyOnInit);
  const isDefaultPrettificationDone = useRef(false);

  const handleResize = (event: any, { element, size, handle }: any) => {
    setEditorHeight(size.height);
  };

  const handleFullScreenToggle = () => {
    setIsFullScreen((prev) => !prev);

    if (!isFullScreen) {
      trackCodeEditorExpandedClick(analyticEventProperties);

      if (!isFullScreenModeOnboardingCompleted) {
        // TODO: @rohanmathur to remove this check after adding shortcut in mocks save button
        const isRuleEditor = location?.pathname.includes(PATHS.RULE_EDITOR.RELATIVE);

        if (isRuleEditor) {
          toast.info(`Use '⌘+S' or 'ctrl+S' to save the rule`, 3);
          // @ts-ignore
          dispatch(globalActions.updateIsCodeEditorFullScreenModeOnboardingCompleted(true));
        }
      }
    } else {
      trackCodeEditorCollapsedClick(analyticEventProperties);
    }
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
        return null;
    }
  }, [language]);

  const editorRefCallback = (editor: ReactCodeMirrorRef) => {
    if (!editorRef.current && editor?.editor && editor?.state && editor?.view) {
      editorRef.current = editor;
      setIsEditorInitialized(true);
    }
  };

  const updateContent = useCallback((code: string) => {
    const view = editorRef.current?.view;
    if (!view) {
      return null;
    }
    const transaction = view.state.update({
      changes: { from: 0, to: view.state.doc.length, insert: code },
    });
    view.dispatch(transaction);
  }, []);

  const applyPrettification = useCallback(() => {
    if (config?.enablePrettify) {
      if (language === EditorLanguage.JSON || language === EditorLanguage.JAVASCRIPT) {
        const prettified = prettifyCode(value, language);
        updateContent(prettified.code);
      }
    }
  }, [config?.enablePrettify, language, value, updateContent]);

  useEffect(() => {
    if (isEditorInitialized) {
      if (!isDefaultPrettificationDone.current && prettifyOnInit) {
        applyPrettification();
        isDefaultPrettificationDone.current = true;
      } else if (!prettifyOnInit) {
        applyPrettification();
      }
    }
  }, [isEditorInitialized, isDefaultPrettificationDone, applyPrettification, prettifyOnInit]);

  const handleEditorClose = useCallback(
    (id: string) => {
      // @ts-expect-error
      dispatch(globalActions.removeToastForEditor({ id }));
    },
    [dispatch]
  );

  const debouncedhandleEditorBodyChange = useDebounce(handleChange, 800);

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

  const toolbar = (
    <CodeEditorToolbar
      language={language}
      code={value}
      isFullScreen={isFullScreen}
      onCodeFormat={(formattedCode: string) => {
        updateContent(formattedCode);
      }}
      isCodePrettified={isCodePrettified}
      setIsCodePrettified={setIsCodePrettified}
      handleFullScreenToggle={handleFullScreenToggle}
      customOptions={toolbarOptions}
      enablePrettify={config.enablePrettify}
    />
  );

  const editor = (
    <CodeMirror
      ref={editorRefCallback}
      className={`code-editor ${envVariables ? "code-editor-with-env-variables" : ""} ${
        !isEditorInitialized ? "not-visible" : ""
      }`}
      width="100%"
      readOnly={isReadOnly}
      value={value ?? ""}
      onChange={debouncedhandleEditorBodyChange}
      theme={vscodeDark}
      extensions={[
        editorLanguage,
        customKeyBinding,
        EditorView.lineWrapping,
        envVariables
          ? highlightVariablesPlugin(
              {
                setHoveredVariable,
                setPopupPosition,
              },
              envVariables
            )
          : null,
      ].filter(Boolean)}
      basicSetup={{
        highlightActiveLine: false,
        bracketMatching: true,
        closeBrackets: true,
        allowMultipleSelections: true,
      }}
      data-enable-grammarly="false"
      data-gramm_editor="false"
      data-gramm="false"
    >
      {envVariables && (
        <div className="editor-popup-container ant-input" onMouseLeave={() => setHoveredVariable(null)}>
          {hoveredVariable && (
            <EditorPopover
              editorRef={{
                current: editorRef.current?.editor ?? null,
              }}
              hoveredVariable={hoveredVariable}
              popupPosition={popupPosition}
              variables={envVariables}
            />
          )}
        </div>
      )}
    </CodeMirror>
  );

  const toastContainer = toastOverlay && (
    <EditorToastContainer
      message={toastOverlay.message}
      type={toastOverlay.type}
      onClose={() => handleEditorClose(toastOverlay.id)}
      isVisible={toastOverlay}
      autoClose={toastOverlay.autoClose}
    />
  );
  return isFullScreen ? (
    <>
      <Modal
        keyboard
        open={isFullScreen}
        destroyOnClose
        onCancel={() => {
          setIsFullScreen(false);
        }}
        closable={false}
        closeIcon={null}
        maskClosable={false}
        wrapClassName="code-editor-fullscreen-modal"
        maskStyle={{ background: "var(--requestly-color-surface-0, #212121)" }}
        footer={<div className="code-editor-character-count">{getByteSize(value)} characters</div>}
      >
        {toolbar}
        {toastContainer}
        {editor}
      </Modal>
    </>
  ) : (
    <>
      {toolbar}
      <ResizableBox
        height={editorHeight}
        width={Infinity}
        onResize={handleResize}
        handle={
          isResizable ? (
            <div className="custom-handle">
              {!hideCharacterCount ? (
                <div className="code-editor-character-count">{getByteSize(value)} characters</div>
              ) : null}
            </div>
          ) : null
        }
        axis="y"
        style={{
          minHeight: `${height}px`,
          marginBottom: isResizable ? "25px" : 0,
        }}
      >
        {toastContainer}
        {editor}
      </ResizableBox>
    </>
  );
};

export default Editor;
