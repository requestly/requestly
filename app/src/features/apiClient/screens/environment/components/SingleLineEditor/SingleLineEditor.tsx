import React, { useRef, useEffect, useState } from "react";
import { EditorView, placeholder as cmPlaceHolder } from "@codemirror/view";
import { EditorState, Transaction } from "@codemirror/state";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { EditorPopover } from "componentsV2/CodeEditor/components/Editor/components/PopOver";
import "componentsV2/CodeEditor/components/Editor/components/PopOver/popover.scss";

interface RQSingleLineEditorProps {
  defaultValue?: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onKeyDown?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
  variables?: Record<string, any>;
}

export const RQSingleLineEditor: React.FC<RQSingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onKeyDown,
  onBlur,
  variables = {},
}) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);
  /*
  onKeyDown, onBlur and onChange is in the useEffect dependencies (implicitly through the editor setup),
  which causes the editor to be recreated when onKeyDown changes
  Hence creating a ref for onKeyDown, onBlur and onChange to avoid the editor being recreated

  */
  const onKeyDownRef = useRef(onKeyDown);
  const onBlurRef = useRef(onBlur);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
  }, [onKeyDown, onBlur, onChange]);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    editorViewRef.current = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: defaultValue ?? "",
        extensions: [
          EditorState.transactionFilter.of((tr) => {
            return tr.newDoc.lines > 1 ? [] : [tr];
          }),
          EditorView.updateListener.of((update) => {
            const isUserInput = update.transactions.find((tr) => tr.annotation(Transaction.userEvent));

            // To prevent calling onChange when defaultValue Changes
            if (update.docChanged && isUserInput) {
              onChange?.(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            blur: (_, view) => {
              onBlurRef.current?.(view.state.doc.toString());
            },
            keydown: (event, view) => {
              const currentText = view.state.doc.toString();
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                onKeyDownRef.current?.(event, currentText);
              } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
                event.preventDefault();
                onKeyDownRef.current?.(event, currentText);
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
              setHoveredVariable,
              setPopupPosition,
            },
            variables
          ),
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
    if (editorViewRef.current && defaultValue !== undefined) {
      const editorView = editorViewRef.current;
      const currentDoc = editorView.state.doc.toString();
      const newDocLength = defaultValue.length;

      if (currentDoc !== defaultValue) {
        const { from = 0, to = 0 } = editorView.state.selection.main;

        editorView.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: defaultValue,
          },
          selection: {
            anchor: from > newDocLength ? newDocLength : from,
            head: to > newDocLength ? newDocLength : to,
          },
        });
      }
    }
  }, [defaultValue]);

  return (
    <>
      <div
        ref={editorRef}
        className={`${className ?? ""} editor-popup-container ant-input`}
        onMouseLeave={() => setHoveredVariable(null)}
      >
        {hoveredVariable && (
          <EditorPopover
            editorRef={editorRef}
            hoveredVariable={hoveredVariable}
            popupPosition={popupPosition}
            variables={variables}
          />
        )}
      </div>
    </>
  );
};
