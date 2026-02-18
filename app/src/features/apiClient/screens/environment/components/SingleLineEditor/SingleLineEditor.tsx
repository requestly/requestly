import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { EditorView, placeholder as cmPlaceHolder, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/commands";
import { VariablePopover } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver";
import "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/variable-popover.scss";
import "./singleLineEditor.scss";
import { SingleLineEditorProps } from "./types";
import { Conditional } from "components/common/Conditional";
import { customKeyBinding, highlightVariablesPlugin } from "componentsV2/CodeEditor/components/EditorV2/plugins";
import { VariableAutocompletePopover } from "../VariableAutocompletePopover/VariableAutocompletePopover";
import { useVariableAutocomplete } from "../hooks/useVariableAutocomplete";

export const RQSingleLineEditor: React.FC<SingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
  onPaste,
  variables,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const {
    autocompleteState,
    autocompleteExtension,
    handleSelectVariable,
    handleCloseAutocomplete,
  } = useVariableAutocomplete(variables, { editorViewRef });

  /*
  onKeyDown, onBlur and onChange is in the useEffect dependencies (implicitly through the editor setup),
  which causes the editor to be recreated when onKeyDown changes
  Hence creating a ref for onKeyDown, onBlur and onChange to avoid the editor being recreated

  */
  const onBlurRef = useRef(onBlur);
  const onChangeRef = useRef(onChange);
  const onPasteRef = useRef(onPaste);
  const previousDefaultValueRef = useRef(defaultValue);
  const isPopoverPinnedRef = useRef(false);

  const emptyVariables = useMemo(() => new Map(), []);

  useEffect(() => {
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
    onPasteRef.current = onPaste;
  }, [onBlur, onChange, onPaste]);

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
          autocompleteExtension,
          EditorView.domEventHandlers({
            blur: (_, view) => {
              onBlurRef.current?.(view.state.doc.toString());
              handleCloseAutocomplete();
            },
            keypress: (event, view) => {
              if (event.key === "Enter") {
                onPressEnter?.(event, view.state.doc.toString());
              }
            },
            paste: (event, view) => {
              const pastedText = event.clipboardData?.getData("text/plain");
              if (!pastedText) return;

              // Call the onPaste handler first to let parent decide if it should handle the paste
              // (e.g., for cURL import)
              onPasteRef.current?.(event, pastedText);
              // If parent didn't prevent default, handle multiline paste conversion
              if (!event.defaultPrevented && pastedText.includes("\n")) {
                event.preventDefault();
                const singleLineText = pastedText.replace(/\\\s*\n\s*/g, " ").replace(/\n/g, " ");
                view.dispatch(
                  view.state.update({
                    changes: {
                      from: view.state.selection.main.from,
                      to: view.state.selection.main.to,
                      insert: singleLineText,
                    },
                  })
                );
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
  }, [placeholder, variables, handleSetVariable]);

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
    <>
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

      <VariableAutocompletePopover
        show={autocompleteState.show}
        position={autocompleteState.position}
        search={autocompleteState.filter}
        variables={variables}
        onSelect={handleSelectVariable}
        onClose={handleCloseAutocomplete}
      />
    </>
  );
};
