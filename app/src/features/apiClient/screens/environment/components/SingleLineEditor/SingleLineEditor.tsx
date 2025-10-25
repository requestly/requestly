import React, { useRef, useEffect, useState } from "react";
import { EditorView, placeholder as cmPlaceHolder, keymap } from "@codemirror/view";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/commands";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { VariablePopover } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver";
import "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/variable-popover.scss";
import generateCompletionsForVariables from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";
import * as Sentry from "@sentry/react";
import "./singleLineEditor.scss";
import { SingleLineEditorProps } from "./types";
import { Conditional } from "components/common/Conditional";
import { maskInput } from "./plugins/secretMaskExtension";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";

export const RQSingleLineEditor: React.FC<SingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
  variables,
  isSecret,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  /*
  onKeyDown, onBlur and onChange is in the useEffect dependencies (implicitly through the editor setup),
  which causes the editor to be recreated when onKeyDown changes
  Hence creating a ref for onKeyDown, onBlur and onChange to avoid the editor being recreated

  */
  const onBlurRef = useRef(onBlur);
  const onChangeRef = useRef(onChange);
  const previousDefaultValueRef = useRef(defaultValue);
  const maskSecretCompartment = useRef(new Compartment()).current;
  // It reconfigures the extension on dependency change

  useEffect(() => {
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
  }, [onBlur, onChange]);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (isSecret) {
      setIsHidden(true);
    }

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    if (typeof defaultValue !== "string") {
      Sentry.captureException(new Error("Editor defaultValue must be a string"), {
        extra: {
          defaultValue,
        },
      });
    }

    /*
    CodeMirror uses extensions to configure DOM interactions.
    Prec.highest ensures your keybinding takes priority.
    Returning true in the run function prevents default browser actions, like the save dialog for Ctrl-S
    */
    editorViewRef.current = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: typeof defaultValue === "string" ? defaultValue : "", // hack to scope down the crash
        extensions: [
          history(),
          keymap.of(historyKeymap),
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

          EditorState.transactionFilter.of((tr) => {
            return tr.newDoc.lines > 1 ? [] : [tr];
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            blur: (_, view) => {
              onBlurRef.current?.(view.state.doc.toString());
            },
            keypress: (event, view) => {
              if (event.key === "Enter") {
                onPressEnter?.(event, view.state.doc.toString());
              }
            },
          }),
          highlightVariablesPlugin(
            {
              setHoveredVariable,
              setPopupPosition,
            },
            variables
          ),
          generateCompletionsForVariables(variables),
          cmPlaceHolder(placeholder ?? "Input here"),
          maskSecretCompartment.of(maskInput(isHidden)),
        ],
      }),
    });

    return () => {
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
    //Need to disable to implement the onChange handler
    // Shouldn't be recreated every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder, variables]);

  useEffect(() => {
    if (defaultValue !== previousDefaultValueRef.current) {
      previousDefaultValueRef.current = defaultValue;
      if (editorViewRef.current) {
        const currentDoc = editorViewRef.current.state.doc.toString();
        if (defaultValue !== currentDoc) {
          const transaction = editorViewRef.current.state.update({
            changes: {
              from: 0,
              to: currentDoc.length,
              insert: defaultValue ?? "",
            },
          });

          // Prevent calling onChange when default value is changed through this useEffect
          const originalOnChange = onChangeRef.current;
          onChangeRef.current = () => {};
          editorViewRef.current.dispatch(transaction);
          onChangeRef.current = originalOnChange;
        }
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: maskSecretCompartment.reconfigure(maskInput(isHidden)),
      });
    }
  }, [isHidden]);

  return (
    <div
      ref={editorRef}
      className={`${className ?? ""} relative editor-popup-container ant-input`}
      onMouseLeave={() => setHoveredVariable(null)}
    >
      <Conditional condition={hoveredVariable}>
        <VariablePopover
          editorRef={editorRef}
          hoveredVariable={hoveredVariable}
          popupPosition={popupPosition}
          variables={variables}
        />
      </Conditional>
      {isSecret ? (
        <button className="eye-icon" onClick={() => setIsHidden((prev) => !prev)}>
          {isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </button>
      ) : null}
    </div>
  );
};
