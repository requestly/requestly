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
import { VariablePopover } from "./components/VariablePopOver";
import "./editor.scss";
import { prettifyCode } from "componentsV2/CodeEditor/utils";
import "./components/VariablePopOver/variable-popover.scss";
import { useDebounce } from "hooks/useDebounce";
import generateCompletionsForVariables from "./plugins/generateAutoCompletions";
interface EditorProps {
  value: string;
  language: EditorLanguage | null;
  isReadOnly?: boolean;
  height?: number;
  isResizable?: boolean;
  scriptId?: string;
  toolbarOptions?: EditorCustomToolbar;
  hideCharacterCount?: boolean;
  handleChange?: (value: string, triggerUnsavedChanges?: boolean) => void;
  prettifyOnInit?: boolean;
  envVariables?: EnvironmentVariables;
  analyticEventProperties?: AnalyticEventProperties;
  showOptions?: {
    enablePrettify?: boolean;
  };
  hideToolbar?: boolean;
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
  analyticEventProperties = {},
  scriptId = "",
  prettifyOnInit = false,
  envVariables,
  showOptions = { enablePrettify: true },
  hideToolbar = false,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [hoveredVariable, setHoveredVariable] = useState(null);
  const isFullScreenModeOnboardingCompleted = useSelector(getIsCodeEditorFullScreenModeOnboardingCompleted);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[scriptId], [allEditorToast, scriptId]); // todo: rename
  const [isCodePrettified, setIsCodePrettified] = useState(false);
  const isDefaultPrettificationDone = useRef(false);
  const isUnsaveChange = useRef(false);
  const [isFullScreen, setFullScreen] = useState(false);

  const handleFullScreenChange = () => {
    setFullScreen((prev) => !prev);
  };

  const handleResize = (event: any, { element, size, handle }: any) => {
    setEditorHeight(size.height);
  };

  const handleFullScreenToggle = useCallback(() => {
    handleFullScreenChange();
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
  }, [analyticEventProperties, dispatch, isFullScreen, isFullScreenModeOnboardingCompleted, location?.pathname]);

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

  // To initialize the editor
  const editorRefCallback = (editor: ReactCodeMirrorRef) => {
    if (editor?.editor && editor?.state && editor?.view) {
      editorRef.current = editor;
      setIsEditorInitialized(true);
    }
  };

  /*
  (fx) sets the implicit change in the editor, prettification change is implicit change
  Typing edits in editor is controlled by handleChange
  */
  const handleEditorSilentUpdate = useCallback((code: string): void => {
    if (code === null || code === undefined) {
      return;
    }
    const view = editorRef.current?.view;
    const doc = view?.state?.doc;

    if (!view || !doc) {
      return null;
    }
    // Not mark prettify as unsaved change, that is just a effect
    isUnsaveChange.current = false;
    const transaction = view.state.update({
      changes: { from: 0, to: doc.length, insert: code },
    });
    view.dispatch(transaction);
  }, []);

  const applyPrettification = useCallback(async () => {
    if (showOptions?.enablePrettify) {
      if (language === EditorLanguage.JSON || language === EditorLanguage.JAVASCRIPT) {
        const prettified = await prettifyCode(value, language);
        setIsCodePrettified(true);
        handleEditorSilentUpdate(prettified.code);
      }
    }
  }, [showOptions?.enablePrettify, language, value, handleEditorSilentUpdate]);

  useEffect(() => {
    if (!isEditorInitialized) return;

    if (!isDefaultPrettificationDone.current && prettifyOnInit) {
      (async () => {
        await applyPrettification();
        isDefaultPrettificationDone.current = true;
      })();
    }
  }, [isEditorInitialized, isDefaultPrettificationDone, applyPrettification, prettifyOnInit, isFullScreen]);

  // Reinitializing the fullscreen editor
  useEffect(() => {
    isDefaultPrettificationDone.current = false;
    setIsEditorInitialized(false);
  }, [isFullScreen]);

  const handleEditorClose = useCallback(
    (scriptId: string) => {
      dispatch(globalActions.removeToastForEditor({ scriptId }));
    },
    [dispatch]
  );

  const debouncedhandleEditorBodyChange = useDebounce((value: string) => {
    handleChange(value, isUnsaveChange.current);
  }, 200);

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

  const toolbar = useMemo(
    () => (
      <CodeEditorToolbar
        language={language}
        code={value}
        isFullScreen={isFullScreen}
        onCodeFormat={(formattedCode: string) => {
          handleEditorSilentUpdate(formattedCode);
        }}
        isCodePrettified={isCodePrettified}
        setIsCodePrettified={setIsCodePrettified}
        handleFullScreenToggle={handleFullScreenToggle}
        customOptions={toolbarOptions}
        enablePrettify={showOptions.enablePrettify}
      />
    ),
    [
      handleFullScreenToggle,
      isCodePrettified,
      isFullScreen,
      language,
      showOptions.enablePrettify,
      toolbarOptions,
      handleEditorSilentUpdate,
      value,
    ]
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
      onKeyDown={() => (isUnsaveChange.current = true)}
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
        generateCompletionsForVariables(envVariables),
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
            <VariablePopover
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
      onClose={() => handleEditorClose(toastOverlay.scriptId)}
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
          handleFullScreenToggle();
        }}
        closable={false}
        closeIcon={null}
        maskClosable={false}
        wrapClassName="code-editor-fullscreen-modal"
        maskStyle={{ background: "var(--requestly-color-surface-0, #212121)" }}
        footer={<div className="code-editor-character-count">{getByteSize(value)} characters</div>}
      >
        {!hideToolbar && toolbar}
        {toastContainer}
        {editor}
      </Modal>
    </>
  ) : (
    <>
      {!hideToolbar && toolbar}
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
