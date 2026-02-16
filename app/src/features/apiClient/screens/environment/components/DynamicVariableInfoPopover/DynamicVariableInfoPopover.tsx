import React from "react";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { VariableScope } from "backend/environment/types";
import "./dynamicVariableInfoPopover.scss";
import { DynamicVariable } from "lib/dynamic-variables/types";

interface DynamicVariableInfoPopoverProps {
  variable: DynamicVariable;
  showIconHeader?: boolean; // Optional prop to control header display with icon
}

/**
 * Displays a tooltip with information about a dynamic variable.
 * Shows the variable name, scope, description, and example usage.
 */
export const DynamicVariableInfoPopover: React.FC<DynamicVariableInfoPopoverProps> = ({
  variable,
  showIconHeader = false,
}) => {
  if (!variable) return null;

  const displayName = variable.name;
  const exampleText = variable.example;
  const descriptionText = variable.description;

  return (
    <div className="dynamic-variable-popover">
      <div className="popover-header">
        {displayName && showIconHeader && (
          <div className="header-with-icon">
            <span className="main-header">{getScopeIcon(VariableScope.DYNAMIC, true, true)}</span>
            <span className="variable-name">{displayName}</span>
          </div>
        )}
        {descriptionText && <div className="header-text">{descriptionText}</div>}
      </div>
      {exampleText && (
        <div className="popover-body">
          <span className="example-title">Example:</span>
          <div className="example-content">{exampleText}</div>
        </div>
      )}
    </div>
  );
};
