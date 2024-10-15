import React, { useRef, useEffect, useState } from "react";
import { EditorView, placeholder as cmPlaceHolder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SingleLineEditor.scss";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { Popover, Row } from "antd";
import { RQButton } from "../RQButton/RQButton";

interface RQSingleLineEditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onPressEnter?: () => void;
  onBlur?: () => void;
}

export const RQSingleLineEditor: React.FC<RQSingleLineEditorProps> = ({
  className,
  value,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
}) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorViewRef.current) {
      return;
    }

    editorViewRef.current = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: value ?? "",
        extensions: [
          EditorView.lineWrapping, // Keep the editor single line
          EditorState.transactionFilter.of((tr) => {
            return tr.newDoc.lines > 1 ? [] : [tr]; // Prevent new lines
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange?.(update.state.doc.toString());
            }
          }),
          highlightVariablesPlugin({
            setHoveredVariable,
            setPopupPosition,
          }),
          cmPlaceHolder(placeholder ?? "Input here"),
        ],
      }),
    });

    return () => {
      editorViewRef.current?.destroy();
    };
    //Need to disable to implement the onChange handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  useEffect(() => {
    if (value && editorViewRef.current) {
      editorViewRef.current?.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <>
      <div ref={editorRef} className="single-line-editor-container ant-input"></div>
      {hoveredVariable && (
        <Popover
          content={
            <div className="variable-info-body">
              <AddNewVariable />
            </div>
          }
          open={!!hoveredVariable}
          destroyTooltipOnHide
          placement="bottom"
          arrowContent={null}
          arrowPointAtCenter={null}
          overlayClassName="variable-info-popover"
        >
          <div
            style={{
              position: "absolute",
              top: popupPosition?.y,
              left: popupPosition?.x,
            }}
            className="variable-info-div"
          ></div>
        </Popover>
      )}
    </>
  );
};

const VariableInfo = () => {
  return (
    <>
      <Row className="variable-info-header">{"db_connection_string"}</Row>
      <div className="variable-info-content">
        <div className="variable-info-title">Type</div>
        <div className="variable-info-value">{"<Type>"}</div>
        <div className="variable-info-title">Initial Value</div>
        <div className="variable-info-value">{"<Intitial Value>"}</div>
        <div className="variable-info-title">Current Value</div>
        <div className="variable-info-value">{"<Current Value>"}</div>
      </div>
    </>
  );
};

const AddNewVariable = () => {
  return (
    <>
      <Row className="variable-info-header">{"Variable is not defined or resolved"}</Row>
      <Row className="add-new-variable-info-content">
        {"Make sure that the variable is defined in the globals or any of the active environments."}
      </Row>
      <RQButton block type="primary" className="add-new-variable-btn">
        {"Add as a new variable"}
      </RQButton>
    </>
  );
};
