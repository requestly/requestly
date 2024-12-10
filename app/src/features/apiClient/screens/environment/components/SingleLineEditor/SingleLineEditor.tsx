import React, { useRef, useEffect, useState } from "react";
import { EditorView, placeholder as cmPlaceHolder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SingleLineEditor.scss";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { SingleLineEditorPopover } from "./SingleLineEditorPopover";

interface RQSingleLineEditorProps {
  defaultValue?: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
  variables?: Record<string, any>;
}

export const RQSingleLineEditor: React.FC<RQSingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
  variables = {},
}) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorViewRef.current) {
      editorViewRef.current.destroy(); // Destroy the current editor view
      editorViewRef.current = null; // Reset the reference
    }

    editorViewRef.current = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: defaultValue ?? "",
        extensions: [
          EditorState.transactionFilter.of((tr) => {
            return tr.newDoc.lines > 1 ? [] : [tr]; // Prevent new lines
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange?.(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            blur: (_, view) => {
              onBlur?.(view.state.doc.toString());
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
      editorViewRef.current = null; // Ensure cleanup
    };

    //Need to disable to implement the onChange handler
    // Shouldn't be recreated every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder, variables]);

  return (
    <>
      <div
        ref={editorRef}
        className={`${className ?? ""} single-line-editor-container ant-input`}
        onMouseLeave={() => setHoveredVariable(null)}
      >
        {hoveredVariable && (
          <SingleLineEditorPopover
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
