import React from "react";
import { Popover } from "antd";
import { ScopedVariables, ScopedVariable } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { EnvironmentVariableType, VariableScope } from "backend/environment/types";
import { capitalize } from "lodash";
import "./variable-suggestions-popover.scss";

interface VariableSuggestionsPopoverProps {
  show: boolean;
  query: string;
  position: { x: number; y: number };
  selectedIndex: number;
  variables: ScopedVariables;
  editorRef: React.RefObject<HTMLDivElement>;
  onSelect: (variableKey: string) => void;
  onSelectionChange: (index: number) => void;
}

// Helper function for rendering variable details (right column)
const renderVariableDetails = (variable: ScopedVariable | null) => {
  if (!variable) return null;

  const [varData, source] = variable;

  const sanitizeValue = (value: any) => {
    if (varData.type === EnvironmentVariableType.Secret) {
      return "•".repeat(String(value || "").length);
    }
    return value === undefined || value === null ? "" : `${value}`;
  };

  const syncValue = sanitizeValue(varData.syncValue);
  const localValue = sanitizeValue(varData.localValue);
  const isPersisted = `${varData.isPersisted}`;

  const infoFields =
    source.scope === VariableScope.RUNTIME
      ? [
          { label: "Type", value: capitalize(varData.type) },
          { label: "Current Value", value: localValue },
          { label: "Is persistent", value: isPersisted },
        ]
      : [
          { label: "Type", value: capitalize(varData.type) },
          { label: "Initial Value", value: syncValue },
          { label: "Current Value", value: localValue },
        ];

  return (
    <div className="variable-details-content">
      <div className="variable-details-grid">
        {infoFields.map(({ label, value }) => (
          <React.Fragment key={label}>
            <div className="variable-details-label">{label}</div>
            <div className="variable-details-value">{value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const VariableSuggestionsPopover: React.FC<VariableSuggestionsPopoverProps> = ({
  show,
  query,
  position,
  selectedIndex,
  variables,
  editorRef,
  onSelect,
  onSelectionChange,
}) => {
  // Filter variables based on query
  const filteredVariables = Array.from(variables.entries()).filter(([key]) =>
    key.toLowerCase().includes(query.toLowerCase())
  );

  const activeVariable = filteredVariables[selectedIndex] || filteredVariables[0] || null;
  const activeVariableData = activeVariable ? activeVariable[1] : null;

  // Calculate position relative to editor
  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: position.y - (editorRef.current?.getBoundingClientRect().top ?? 0) + 2,
    left: position.x - (editorRef.current?.getBoundingClientRect().left ?? 0),
    zIndex: 10000,
  };

  if (!show || filteredVariables.length === 0) {
    return null;
  }

  return (
    <Popover
      content={
        <div className="variable-suggestions-popover-container">
          {/* Left column - Variables list */}
          <div className="variable-suggestions-popover-list">
            {filteredVariables.map(([key], index) => (
              <div
                key={key}
                className={`variable-suggestions-popover-item ${index === selectedIndex ? "selected" : ""}`}
                onClick={() => onSelect(key)}
                onMouseEnter={() => onSelectionChange(index)}
              >
                {key}
              </div>
            ))}
          </div>

          {/* Right column - Variable details */}
          <div className="variable-suggestions-popover-details">
            {activeVariableData ? (
              renderVariableDetails(activeVariableData)
            ) : (
              <div className="variable-suggestions-popover-empty">No variables found</div>
            )}
          </div>
        </div>
      }
      open={show}
      placement="bottomLeft"
      trigger={[]}
      destroyTooltipOnHide={true}
      showArrow={false}
      overlayStyle={{ background: "transparent", boxShadow: "none", border: "none" }}
      overlayClassName="variable-suggestions-popover"
    >
      <div style={popupStyle} className="variable-suggestions-popover-anchor"></div>
    </Popover>
  );
};
