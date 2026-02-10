import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { EditorView, placeholder as cmPlaceHolder, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/commands";
import { startCompletion } from "@codemirror/autocomplete";
import { VariablePopover } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver";
import "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/variable-popover.scss";
import * as Sentry from "@sentry/react";
import "./singleLineEditor.scss";
import { SingleLineEditorProps } from "./types";
import { Conditional } from "components/common/Conditional";
import {
  customKeyBinding,
  highlightVariablesPlugin,
  generateCompletionsForVariables,
} from "componentsV2/CodeEditor/components/EditorV2/plugins";

export const RQSingleLineEditor: React.FC<SingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
  variables,
  suggestions,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  /*
  onKeyDown, onBlur and onChange is in the useEffect dependencies (implicitly through the editor setup),
  which causes the editor to be recreated when onKeyDown changes
  Hence creating a ref for onKeyDown, onBlur and onChange to avoid the editor being recreated

  */
  const onBlurRef = useRef(onBlur);
  const onChangeRef = useRef(onChange);
  const previousDefaultValueRef = useRef(defaultValue);
  const isPopoverPinnedRef = useRef(false);

  const emptyVariables = useMemo(() => new Map(), []);

  useEffect(() => {
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
  }, [onBlur, onChange]);

  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPopoverPinned, setIsPopoverPinned] = useState(false);

  useEffect(() => {
    isPopoverPinnedRef.current = isPopoverPinned;
  }, [isPopoverPinned]);

  const handleMouseLeave = useCallback(() => {
    if (!isPopoverPinnedRef.current) {
      setHoveredVariable(null);
    }
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

  useEffect(() => {
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

    if (!editorRef.current) return;
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
          customKeyBinding,
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
            focus: (_, view) => {
              if (suggestions?.length) {
                setTimeout(() => startCompletion(view), 0);
              }
            },
            keypress: (event, view) => {
              if (event.key === "Enter") {
                onPressEnter?.(event, view.state.doc.toString());
              }
            },
          }),
          highlightVariablesPlugin(
            {
              handleSetVariable,
              setPopupPosition,
            },
            variables || emptyVariables
          ),
          generateCompletionsForVariables(variables, suggestions),
          cmPlaceHolder(placeholder ?? "Input here"),
        ].filter((ext): ext is NonNullable<typeof ext> => ext !== null),
      }),
    });

    return () => {
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
    //Need to disable to implement the onChange handler
    // Shouldn't be recreated every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder, variables, handleSetVariable, suggestions]);

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

  const handleClosePopover = useCallback(() => {
    setHoveredVariable(null);
    setIsPopoverPinned(false);
  }, []);

  return (
    <div
      ref={editorRef}
      className={`${className ?? ""} editor-popup-container ant-input`}
      onMouseLeave={handleMouseLeave}
    >
      <Conditional condition={!!hoveredVariable}>
        <VariablePopover
          editorRef={editorRef as React.RefObject<HTMLDivElement>}
          hoveredVariable={hoveredVariable || ""}
          popupPosition={popupPosition}
          variables={variables || emptyVariables}
          onClose={handleClosePopover}
          onPinChange={setIsPopoverPinned}
        />
      </Conditional>
    </div>
  );
};
