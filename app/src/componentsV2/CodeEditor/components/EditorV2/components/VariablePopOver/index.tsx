import React from "react";
import { Popover, Row, Tag } from "antd";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { capitalize } from "lodash";
import { pipe } from "lodash/fp";
import { ScopedVariable, ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { PiHighlighterBold } from "@react-icons/all-files/pi/PiHighlighterBold";
import { VariableData } from "features/apiClient/store/variables/types";

interface VariablePopoverProps {
  hoveredVariable: string;
  popupPosition: { x: number; y: number };
  editorRef: React.RefObject<HTMLDivElement>;
  variables: ScopedVariables;
}

export const VariablePopover: React.FC<VariablePopoverProps> = ({
  hoveredVariable,
  editorRef,
  popupPosition,
  variables,
}) => {
  const variableData = variables.get(hoveredVariable);
  const popoverContent = variableData ? (
    <VariableInfo
      params={{
        name: hoveredVariable,
        variable: variableData,
      }}
    />
  ) : (
    <VariableNotFound />
  );

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: popupPosition?.y - editorRef.current?.getBoundingClientRect().top + 10,
    left: popupPosition?.x - editorRef.current?.getBoundingClientRect().left + 100,
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

function getSanitizedVariableValue(variable: VariableData) {
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
    isPersisted: makeRenderable(variable.isPersisted),
  };
}

const VariableInfo: React.FC<{
  params: {
    name: string;
    variable: ScopedVariable;
  };
}> = ({
  params: {
    name,
    variable: [variable, source],
  },
}) => {
  const { syncValue, localValue, isPersisted } = getSanitizedVariableValue(variable);
  const infoFields =
    source.scope === VariableScope.RUNTIME
      ? [
          { label: "Name", value: name },
          { label: "Type", value: capitalize(variable.type) },
          { label: "Current Value", value: syncValue },
          { label: "Is persistent", value: isPersisted },
        ]
      : [
          { label: "Name", value: name },
          { label: "Type", value: capitalize(variable.type) },
          { label: "Initial Value", value: syncValue },
          { label: "Current Value", value: localValue },
        ];

  return (
    <>
      <div className="variable-info-property-container">
        <Tag icon={<PiHighlighterBold />} className="variable-info-header">
          {source.scope}
        </Tag>

        {source.scope !== VariableScope.RUNTIME && (
          <>
            <span className="variable-header-info-seperator">/</span>
            <div className="variable-info-header-name">{source.name}</div>
          </>
        )}
      </div>

      <div className="variable-info-content-container">
        <div className="variable-info-content">
          {infoFields.map(({ label, value }) => (
            <React.Fragment key={label}>
              <div className="variable-info-title">{label}</div>
              <div className="variable-info-value">{value}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

const VariableNotFound: React.FC<{}> = () => {
  return (
    <>
      <div className="variable-not-found-info-container">
        <Row className="variable-info-header">{"Variable is not defined or resolved"}</Row>
        <Row className="add-new-variable-info-content">
          {"Make sure that the variable is defined in the globals or any of the active environments."}
        </Row>
      </div>
    </>
  );
};
