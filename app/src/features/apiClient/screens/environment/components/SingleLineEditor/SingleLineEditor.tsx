import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { EditorView, placeholder as cmPlaceHolder, keymap } from "@codemirror/view";
import { EditorState, Prec } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/commands";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { VariablePopover } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver";
import "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/variable-popover.scss";
import { generateCompletionsWithPopover } from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";
import { VariableSuggestionsPopover } from "componentsV2/CodeEditor/components/EditorV2/components/VariableSuggestionsPopover";
import "componentsV2/CodeEditor/components/EditorV2/components/VariableSuggestionsPopover/variable-suggestions-popover.scss";
import { useOutsideClick } from "hooks/useOutsideClick";
import * as Sentry from "@sentry/react";
import "./singleLineEditor.scss";
import { SingleLineEditorProps } from "./types";
import { Conditional } from "components/common/Conditional";

export const RQSingleLineEditor: React.FC<SingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
  variables,
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

  useEffect(() => {
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
  }, [onBlur, onChange]);

  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autocompleteRange, setAutocompleteRange] = useState<{ from: number; to: number } | null>(null);

  // Handle click outside to close autocomplete
  const handleOutsideClick = useCallback(() => {
    if (showAutocomplete) {
      setShowAutocomplete(false);
    }
  }, [showAutocomplete]);

  const { ref: outsideClickRef } = useOutsideClick<HTMLDivElement>(handleOutsideClick);

  // Create autocomplete setters with insertion logic
  const autocompleteSetters = useMemo(
    () => ({
      setShowAutocomplete,
      setAutocompleteQuery,
      setAutocompletePosition,
      setSelectedIndex,
      setAutocompleteRange,
      insertVariable: (view: EditorView, variableKey: string, range: { from: number; to: number }) => {
        const state = view.state;
        const { from, to } = range;

        // Look ahead for closing braces
        const LOOK_AHEAD_BUFFER = 10;
        const lookahead = state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
        const nextChars = lookahead.trimStart().slice(0, 2);
        const closingChars = nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";

        view.dispatch({
          changes: {
            from,
            to,
            insert: `{{${variableKey}${closingChars}`,
          },
          selection: { anchor: from + `{{${variableKey}${closingChars}`.length },
        });

        setShowAutocomplete(false);
      },
    }),
    []
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

    /*
    CodeMirror uses extensions to configure DOM interactions.
    Prec.highest ensures your keybinding takes priority.
    Returning true in the run function prevents default browser actions, like the save dialog for Ctrl-S
    */
    editorViewRef.current = new EditorView({
      parent: editorRef.current!,
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
            variables!
          ),
          generateCompletionsWithPopover(autocompleteSetters, variables!),
          cmPlaceHolder(placeholder ?? "Input here"),
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

  // Combine refs: editorRef for CodeMirror and outsideClickRef for click detection
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (node) {
        outsideClickRef.current = node;
      }
    },
    [outsideClickRef]
  );

  return (
    <div
      ref={combinedRef}
      className={`${className ?? ""} editor-popup-container ant-input`}
      onMouseLeave={() => setHoveredVariable(null)}
    >
      <Conditional condition={Boolean(hoveredVariable)}>
        <VariablePopover
          editorRef={editorRef}
          hoveredVariable={hoveredVariable as string}
          popupPosition={popupPosition}
          variables={variables ?? new Map()}
        />
      </Conditional>
      <Conditional condition={showAutocomplete && Boolean(variables)}>
        <VariableSuggestionsPopover
          show={showAutocomplete}
          query={autocompleteQuery}
          position={autocompletePosition}
          selectedIndex={selectedIndex}
          variables={variables ?? new Map()}
          editorRef={editorRef}
          onSelect={(variableKey) => {
            if (autocompleteRange && editorViewRef.current) {
              autocompleteSetters.insertVariable(editorViewRef.current, variableKey, autocompleteRange);
            }
          }}
          onSelectionChange={setSelectedIndex}
        />
      </Conditional>
    </div>
  );
};
