import React from "react";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { VariableScope } from "backend/environment/types";
import "./dynamicVariableInfoPopover.scss";

export interface DynamicVariableInfoTypes {
  key?: string;
  label?: string;
  scope?: VariableScope | string;
  header?: string | unknown;
  content?: string | unknown;
  [key: string]: any; // Allow additional properties for flexibility
}

interface DynamicVariableInfoPopoverProps {
  variable: DynamicVariableInfoTypes;
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

  const displayName = variable.key || variable.label;
  const headerText = typeof variable.header === "string" ? variable.header : "undefined";
  const contentText = typeof variable.content === "string" ? variable.content : "undefined";

  return (
    <div className="dynamic-variable-popover">
      <div className="popover-header">
        {variable.scope && displayName && showIconHeader && (
          <div className="header-with-icon">
            <span className="main-header">
              {getScopeIcon(variable.scope as VariableScope, true, variable.scope as VariableScope)}
            </span>
            <span className="variable-name">{displayName}</span>
          </div>
        )}
        {headerText && <div className="header-text">{headerText}</div>}
      </div>
      {contentText && (
        <div className="popover-body">
          <span className="example-title">Example:</span>
          <div className="example-content">{contentText}</div>
        </div>
      )}
    </div>
  );
};
