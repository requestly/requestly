import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
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
import { customCompletions, SANDBOX } from "./plugins/autocompletions";
interface EditorProps {
  value: string;
  defaultValue?: string; // required in the special case of rules where value and default value need to stay in sync
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
  defaultValue = "",
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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const [editorContent, setEditorContent] = useState(value);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hoveredVariable, setHoveredVariable] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const isFullScreenModeOnboardingCompleted = useSelector(getIsCodeEditorFullScreenModeOnboardingCompleted);

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

  // This is to set the editor content only once when the value is set for the first time
  // Remove this when the editor is refactored to use controlled input and current problem is fixed
  // Current problem: When the value is set for the first time, the consequent changes in props.value is not reflected in the editor @nafees87n
  const isEditorContentSet = useRef(false);
  useEffect(() => {
    if (!isEditorContentSet.current) {
      if (!value?.length) {
        setEditorContent(defaultValue);
      } else {
        setEditorContent(value);
        isEditorContentSet.current = true;
      }
    }
  }, [defaultValue, value]);

  // Had to keep both useEffects because some cases were not handled with the above useEffect

  useEffect(() => {
    if (!value?.length) {
      setEditorContent(defaultValue);
    } else {
      setEditorContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    if (!isDefaultPrettificationDone.current) {
      if (prettifyOnInit && (language === EditorLanguage.JSON || language === EditorLanguage.JAVASCRIPT)) {
        const prettifiedCode = prettifyCode(value, language);
        setEditorContent(prettifiedCode.code);
        handleChange(prettifiedCode.code);
        isDefaultPrettificationDone.current = true;
      }
    }
  }, [prettifyOnInit, language]);

  const handleEditorClose = useCallback(
    (id: string) => {
      // @ts-expect-error
      dispatch(globalActions.removeToastForEditor({ id }));
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
        <CodeEditorToolbar
          language={language}
          code={editorContent}
          isFullScreen={isFullScreen}
          onCodeFormat={(formattedCode: string) => {
            setEditorContent(formattedCode);
          }}
          isCodePrettified={isCodePrettified}
          setIsCodePrettified={setIsCodePrettified}
          handleFullScreenToggle={handleFullScreenToggle}
          customOptions={toolbarOptions}
          enablePrettify={config.enablePrettify}
        />

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
            defaultValue={defaultValue}
            onChange={handleEditorBodyChange}
            theme={vscodeDark}
            extensions={[editorLanguage, EditorView.lineWrapping].filter(Boolean)}
            basicSetup={{
              highlightActiveLine: false,
              bracketMatching: true,
              closeBrackets: true,
              allowMultipleSelections: true,
            }}
            data-enable-grammarly="false"
            data-gramm_editor="false"
            data-gramm="false"
          />
        </>
      </Modal>
    </>
  ) : (
    <>
      <CodeEditorToolbar
        language={language}
        code={editorContent}
        isFullScreen={isFullScreen}
        onCodeFormat={(formattedCode: string) => {
          setEditorContent(formattedCode);
        }}
        isCodePrettified={isCodePrettified}
        setIsCodePrettified={setIsCodePrettified}
        handleFullScreenToggle={handleFullScreenToggle}
        customOptions={toolbarOptions}
        enablePrettify={config?.enablePrettify}
      />
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
            ref={(instance) => {
              if (instance) {
                editorRef.current = instance.editor;
              }
            }}
            className={`code-editor ${envVariables ? "code-editor-with-env-variables" : ""}`}
            width="100%"
            readOnly={isReadOnly}
            value={editorContent ?? ""}
            defaultValue={defaultValue}
            onChange={handleEditorBodyChange}
            theme={vscodeDark}
            extensions={[
              editorLanguage,
              EditorView.lineWrapping,
              ...(envVariables
                ? [
                    highlightVariablesPlugin(
                      {
                        setHoveredVariable,
                        setPopupPosition,
                      },
                      envVariables
                    ),
                    customCompletions(envVariables, SANDBOX),
                  ]
                : []),
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
                    editorRef={editorRef}
                    hoveredVariable={hoveredVariable}
                    popupPosition={popupPosition}
                    variables={envVariables}
                  />
                )}
              </div>
            )}
          </CodeMirror>
        </>
      </ResizableBox>
    </>
  );
};

export default Editor;
