import React from "react";
import { Popover, Row } from "antd";
import { EnvironmentVariableType, EnvironmentVariableValue, VariableValueType } from "backend/environment/types";
import { capitalize } from "lodash";
import { pipe } from "lodash/fp";

interface VariablePopoverProps {
  hoveredVariable: string;
  popupPosition: { x: number; y: number };
  editorRef: React.RefObject<HTMLDivElement>;
  variables: Record<string, any>;
}

export const VariablePopover: React.FC<VariablePopoverProps> = ({
  hoveredVariable,
  editorRef,
  popupPosition,
  variables = {},
}) => {
  const variableData = variables[hoveredVariable];
  const popoverContent = variableData ? (
    <VariableInfo
      variable={{
        name: hoveredVariable,
        ...variableData,
      }}
    />
  ) : (
    <VariableNotFound />
  );

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: popupPosition?.y - editorRef.current?.getBoundingClientRect().top + 10,
    left: popupPosition?.x - editorRef.current?.getBoundingClientRect().left + 10,
    zIndex: 1000,
  };

  return (
    <Popover
      content={<div className="variable-info-body">{popoverContent}</div>}
      open
      destroyTooltipOnHide
      placement="bottom"
      showArrow={false}
      overlayClassName="variable-info-popover"
    >
      <div style={popupStyle} className="variable-info-div"></div>
    </Popover>
  );
};

function getSanitizedVariableValue(variable: EnvironmentVariableValue) {
  const isSecret = variable.type === EnvironmentVariableType.Secret;
  const makeSecret = (value: VariableValueType) => "•".repeat(String(value || "").length);
  const makeRenderable = (value: VariableValueType) => `${value}`;

  const sanitize = pipe(
    (value: VariableValueType) => (value === undefined || value === null ? "" : value),
    isSecret ? makeSecret : makeRenderable
  );

  return {
    syncValue: sanitize(variable.syncValue),
    localValue: sanitize(variable.localValue),
  };
}

const VariableInfo: React.FC<{
  variable: { name: string } & EnvironmentVariableValue;
}> = ({ variable }) => {
  const { syncValue, localValue } = getSanitizedVariableValue(variable);
  const infoFields = [
    { label: "Type", value: capitalize(variable.type) },
    { label: "Initial Value", value: syncValue },
    { label: "Current Value", value: localValue },
  ];
  return (
    <>
      <Row className="variable-info-header">{variable.name}</Row>
      <div className="variable-info-content">
        {infoFields.map(({ label, value }) => (
          <React.Fragment key={label}>
            <div className="variable-info-title">{label}</div>
            <div className="variable-info-value">{value}</div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

const VariableNotFound: React.FC<{}> = () => {
  return (
    <>
      <Row className="variable-info-header">{"Variable is not defined or resolved"}</Row>
      <Row className="add-new-variable-info-content">
        {"Make sure that the variable is defined in the globals or any of the active environments."}
      </Row>
    </>
  );
};
