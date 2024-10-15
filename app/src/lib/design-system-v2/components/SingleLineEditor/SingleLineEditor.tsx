import React, { useRef, useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SingleLineEditor.scss";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { Popover } from "antd";
import { createPortal } from "react-dom";

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
      {hoveredVariable &&
        createPortal(
          <Popover
            content={`Info about ${hoveredVariable}`}
            title="Variable Info"
            open={true}
            destroyTooltipOnHide
            placement="bottom"
          >
            <div
              style={{
                position: "absolute",
                top: popupPosition?.y,
                left: popupPosition?.x,
              }}
            ></div>
          </Popover>,
          document.body // Render in the portal
        )}
    </>
  );
};
