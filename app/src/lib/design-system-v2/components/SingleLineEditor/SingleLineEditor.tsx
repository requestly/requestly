import React, { useRef, useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SingleLineEditor.scss";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { Popover, Row } from "antd";
import { RQButton } from "../RQButton/RQButton";

export const RQInput: React.FC<{}> = () => {
  const editorRef = useRef(null);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    new EditorView({
      parent: editorRef.current,
      extensions: [
        EditorView.lineWrapping, // Keep the editor single line
        EditorState.transactionFilter.of((tr) => {
          return tr.newDoc.lines > 1 ? [] : [tr]; // Prevent new lines
        }),
        highlightVariablesPlugin({
          setHoveredVariable: (str) => {
            // console.log("!!!debug", "setHoveredVariable", str);
            setHoveredVariable(str);
          },
          setPopupPosition: (position) => {
            // console.log("!!!debug", "setPopup", position);F
            setPopupPosition(position);
          },
        }),
        // highlightVariables,
      ],
    });
  }, []);

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
