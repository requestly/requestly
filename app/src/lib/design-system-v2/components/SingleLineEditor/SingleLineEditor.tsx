import React, { useRef, useEffect, useState, useMemo } from "react";
import { EditorView, placeholder as cmPlaceHolder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./SingleLineEditor.scss";
import { highlightVariablesPlugin } from "./plugins/highlightVariables";
import { Popover, Row } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentVariables, EnvironmentVariableValue } from "backend/environment/types";

interface RQSingleLineEditorProps {
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
}

export const RQSingleLineEditor: React.FC<RQSingleLineEditorProps> = ({
  className,
  defaultValue,
  onChange,
  placeholder,
  onPressEnter,
  onBlur,
}) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const { getCurrentEnvironmentVariables, setVariables, getCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();

  const currentEnvironmentVariables = useMemo(() => {
    return getCurrentEnvironmentVariables();
  }, [getCurrentEnvironmentVariables]);

  useEffect(() => {
    if (editorViewRef.current) {
      return;
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
    // Shouldn't be recreated every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholder]);

  // useEffect(() => {
  //   // if (value && editorViewRef.current) {
  //   //   console.log("!!!debug", "before dispatch", value);
  //   //   editorViewRef.current?.dispatch({
  //   //     changes: {
  //   //       from: 0,
  //   //       to: editorViewRef.current.state.doc.length,
  //   //       insert: value,
  //   //     },
  //   //   });
  //   // }
  // }, [value]);

  const addNewVariable = (newVariable: EnvironmentVariables) => {
    setVariables(currentEnvironmentId, {
      ...currentEnvironmentVariables,
      ...newVariable,
    });
  };

  return (
    <>
      <div
        ref={editorRef}
        className="single-line-editor-container ant-input"
        onMouseLeave={() => setHoveredVariable(null)}
      >
        {hoveredVariable && (
          <Popover
            content={
              <div className="variable-info-body">
                {currentEnvironmentVariables[hoveredVariable] ? (
                  <VariableInfo
                    variable={{
                      name: hoveredVariable,
                      ...currentEnvironmentVariables[hoveredVariable],
                    }}
                  />
                ) : (
                  <AddNewVariable variableName={hoveredVariable} addNewVariable={addNewVariable} />
                )}
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
                top: popupPosition?.y - editorRef.current.getBoundingClientRect().top + 10,
                left: popupPosition?.x - editorRef.current.getBoundingClientRect().left + 10,
                zIndex: 1000,
              }}
              className="variable-info-div"
            ></div>
          </Popover>
        )}
      </div>
    </>
  );
};

const VariableInfo: React.FC<{
  variable: { name: string } & EnvironmentVariableValue;
}> = ({ variable }) => {
  return (
    <>
      <Row className="variable-info-header">{variable.name}</Row>
      <div className="variable-info-content">
        <div className="variable-info-title">Type</div>
        <div className="variable-info-value">{variable.type}</div>
        <div className="variable-info-title">Initial Value</div>
        <div className="variable-info-value">{variable.syncValue}</div>
        <div className="variable-info-title">Current Value</div>
        <div className="variable-info-value">{variable.localValue}</div>
      </div>
    </>
  );
};

const AddNewVariable: React.FC<{
  addNewVariable: (environmentVariables: EnvironmentVariables) => void;
  variableName: string;
}> = ({ addNewVariable, variableName }) => {
  return (
    <>
      <Row className="variable-info-header">{"Variable is not defined or resolved"}</Row>
      <Row className="add-new-variable-info-content">
        {"Make sure that the variable is defined in the globals or any of the active environments."}
      </Row>
      {/* <RQButton
        block
        type="primary"
        className="add-new-variable-btn"
        onClick={() => {
          //TODO: Fix this to add new Variables
          addNewVariable({
            [variableName]: {
              syncValue: "",
              localValue: "",
              type: "string",
            },
          });
        }}
      >
        {"Add as a new variable"}
      </RQButton> */}
    </>
  );
};
