import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, { EditorView, Extension, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { json5 } from "codemirror-json5";
import { json } from "@codemirror/lang-json";
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
import { VariablePopover } from "./components/VariablePopOver";
import "./editor.scss";
import { prettifyCode } from "componentsV2/CodeEditor/utils";
import "./components/VariablePopOver/variable-popover.scss";
import { useDebounce } from "hooks/useDebounce";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { MergeViewEditor } from "componentsV2/CodeEditor/components/EditorV2/components/MergeViewEditor/MergeViewEditor";
import {
  customKeyBinding,
  highlightVariablesPlugin,
  generateCompletionsForVariables,
} from "componentsV2/CodeEditor/components/EditorV2/plugins";
import { placeholder as placeholderExtension } from "@codemirror/view";
import { lintGutter } from "@codemirror/lint";
import { javascriptLinter, jsonLinter, json5Linter } from "./lints/linters";

interface EditorProps {
  value: string;
  language: EditorLanguage | null;
  isReadOnly?: boolean;
  height?: number;
  isResizable?: boolean;
  scriptId?: string;
  toolbarOptions?: EditorCustomToolbar;
  toolbarRightContent?: React.ReactNode;
  hideCharacterCount?: boolean;
  handleChange?: (value: string, triggerUnsavedChanges?: boolean) => void;
  prettifyOnInit?: boolean;
  envVariables?: ScopedVariables;
  analyticEventProperties?: AnalyticEventProperties;
  showOptions?: {
    enablePrettify?: boolean;
  };
  hideToolbar?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onEditorReady?: (view: EditorView) => void;
  mergeView?: {
    incomingValue: string;
    source: "ai" | "user";
    onPartialMerge: (mergedValue: string, newIncomingValue: string, type: "accept" | "reject") => void;
  };
  disableDefaultAutoCompletions?: boolean;
  customTheme?: Extension;
  placeholder?: string;
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
  toolbarRightContent,
  analyticEventProperties = {},
  scriptId = "",
  prettifyOnInit = false,
  envVariables,
  showOptions = { enablePrettify: true },
  hideToolbar = false,
  autoFocus = false,
  onFocus,
  onEditorReady,
  mergeView,
  disableDefaultAutoCompletions = false,
  customTheme,
  placeholder,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);
  const isFullScreenModeOnboardingCompleted = useSelector(getIsCodeEditorFullScreenModeOnboardingCompleted);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const allEditorToast = useSelector(getAllEditorToast);
  const toastOverlay = useMemo(() => allEditorToast[scriptId], [allEditorToast, scriptId]); // todo: rename
  const [isCodePrettified, setIsCodePrettified] = useState(false);
  const isDefaultPrettificationDone = useRef(false);
  const isUnsaveChange = useRef(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [isPopoverPinned, setIsPopoverPinned] = useState(false);

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
      case EditorLanguage.JSON5:
        return json5();
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
      onEditorReady?.(editor.view);
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
      return;
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

  const handleMergeChunk = useCallback(
    (mergedValue: string, newIncomingValue: string, type: "accept" | "reject") => {
      mergeView?.onPartialMerge(mergedValue, newIncomingValue, type);
      // TODO: add analytics for partial merge
    },
    [mergeView]
  );

  useEffect(() => {
    if (!isEditorInitialized) return;

    if (!isDefaultPrettificationDone.current && prettifyOnInit) {
      (async () => {
        await applyPrettification();
        isDefaultPrettificationDone.current = true;
      })();
    }
  }, [isEditorInitialized, isDefaultPrettificationDone, applyPrettification, prettifyOnInit, isFullScreen]);

  useEffect(() => {
    if (autoFocus && isEditorInitialized && editorRef.current?.view) {
      const timer = setTimeout(() => {
        editorRef.current?.view?.focus();
        onFocus?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, isEditorInitialized, onFocus]);

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
        rightContent={toolbarRightContent}
      />
    ),
    [
      handleFullScreenToggle,
      isCodePrettified,
      isFullScreen,
      language,
      showOptions.enablePrettify,
      toolbarOptions,
      toolbarRightContent,
      handleEditorSilentUpdate,
      value,
    ]
  );

  const extensions: Extension[] = [];

  if (editorLanguage) {
    extensions.push(editorLanguage);
  }

  if (language === EditorLanguage.JAVASCRIPT) {
    extensions.push(lintGutter(), javascriptLinter());
  }

  if (language === EditorLanguage.JSON) {
    extensions.push(lintGutter(), jsonLinter());
  }

  if (language === EditorLanguage.JSON5) {
    extensions.push(lintGutter(), json5Linter());
  }

  if (customTheme) {
    extensions.push(customTheme);
  }

  if (placeholder) {
    extensions.push(placeholderExtension(placeholder));
  }

  extensions.push(customKeyBinding, EditorView.lineWrapping);

  if (envVariables) {
    extensions.push(
      highlightVariablesPlugin(
        {
          setHoveredVariable,
          setPopupPosition,
        },
        envVariables
      )
    );
  }

  const completionExtension = generateCompletionsForVariables(envVariables);
  if (completionExtension) {
    extensions.push(completionExtension);
  }

  const handleMouseLeave = useCallback(() => {
    if (!isPopoverPinned) {
      setHoveredVariable(null);
    }
  }, [isPopoverPinned]);

  const handleClosePopover = useCallback(() => {
    setHoveredVariable(null);
    setIsPopoverPinned(false);
  }, []);

  const handleSetVariable = useCallback(
    (variable: string | null) => {
      if (!variable) {
        handleMouseLeave();
      } else {
        setHoveredVariable(variable);
      }
    },
    [handleMouseLeave]
  );

  const editor = (
    <>
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
          customTheme,
          placeholder ? placeholderExtension(placeholder) : null,
          customKeyBinding,
          EditorView.lineWrapping,
          envVariables
            ? highlightVariablesPlugin(
                {
                  handleSetVariable,
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
          autocompletion: !disableDefaultAutoCompletions,
        }}
        data-enable-grammarly="false"
        data-gramm_editor="false"
        data-gramm="false"
      />
      <div className="editor-popup-container" onMouseLeave={handleMouseLeave}>
        {hoveredVariable && envVariables && (
          <VariablePopover
            hoveredVariable={hoveredVariable}
            popupPosition={popupPosition}
            variables={envVariables}
            onPinChange={setIsPopoverPinned}
            onClose={handleClosePopover}
          />
        )}
      </div>
    </>
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
        {mergeView ? (
          <MergeViewEditor
            originalValue={value}
            newValue={mergeView.incomingValue}
            onMergeChunk={handleMergeChunk}
            onEditorReady={editorRefCallback}
          />
        ) : (
          editor
        )}
      </ResizableBox>
    </>
  );
};

export default Editor;
