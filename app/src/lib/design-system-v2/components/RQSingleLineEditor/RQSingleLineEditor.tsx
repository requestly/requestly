import React, { useRef, useEffect, useState } from "react";
import { EditorView, placeholder as cmPlaceHolder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { Position, RQSingleLineEditorProps } from "./types";
import { createHighlightPlugin } from "./plugins/highlightVariables";
import "./RQSingleLineEditor.scss";

export const RQSingleLineEditor: React.FC<RQSingleLineEditorProps> = ({
  editorRef: externalEditorRef,
  className,
  defaultValue = "",
  onChange,
  placeholder = "Input here",
  onPressEnter,
  onBlur,
  variables,
  highlightConfig,
  renderPopover,
}) => {
  const internalEditorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<Position>({ x: 0, y: 0 });

  const editorRef = externalEditorRef || internalEditorRef;

  useEffect(() => {
    if (editorViewRef.current) {
      return;
    }

    const extensions = [
      EditorState.transactionFilter.of((tr) => {
        return tr.newDoc.lines > 1 ? [] : [tr];
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
      cmPlaceHolder(placeholder),
    ];

    if (highlightConfig) {
      extensions.push(
        createHighlightPlugin({
          variables,
          highlightConfig,
          onVariableHover: (variable, position) => {
            setHoveredVariable(variable);
            setPopoverPosition(position);
          },
        })
      );
    }

    editorViewRef.current = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: defaultValue,
        extensions,
      }),
    });

    return () => {
      editorViewRef.current?.destroy();
    };

    //Need to disable to implement the onChange handler
    // Shouldn't be recreated every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  return (
    <div
      ref={editorRef}
      className={`single-line-editor-container ant-input ${className ?? ""}`}
      onMouseLeave={() => setHoveredVariable(null)}
    >
      {hoveredVariable &&
        renderPopover?.({
          variable: hoveredVariable,
          position: {
            y: popoverPosition.y - editorRef.current.getBoundingClientRect().top + 5,
            x: popoverPosition.x - editorRef.current.getBoundingClientRect().left + 5,
          },
          variables,
        })}
    </div>
  );
};
