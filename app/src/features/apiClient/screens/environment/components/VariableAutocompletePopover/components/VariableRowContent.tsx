import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import {
  AutocompleteItem,
  checkIsDynamicVariable,
  checkIsSecretsVariable,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { VariableScope } from "backend/environment/types";

export const VariableRowContent: React.FC<{ item: AutocompleteItem; hideIcon?: boolean }> = ({
  item,
  hideIcon = false,
}) => {
  const isDynamic = checkIsDynamicVariable(item.variable);
  const isSecret = checkIsSecretsVariable(item.variable);
  const variableScope = Array.isArray(item.variable) ? item.variable[1].scope : item.variable.scope;
  const variableSourceName = Array.isArray(item.variable) ? item.variable[1].name : null;
  const variableValue = Array.isArray(item.variable)
    ? item.variable[0].localValue || item.variable[0].syncValue
    : "value" in item.variable
    ? item.variable.value
    : "";

  const scopeTooltipTitle = isSecret
    ? "Scope: Secrets"
    : variableScope === VariableScope.DYNAMIC
    ? "Scope: Dynamic"
    : `Scope: ${capitalize(String(variableScope))} environment`;

  return (
    <>
      <div className="item-left-section">
        {!hideIcon && (
          <Tooltip title={scopeTooltipTitle} placement="top" showArrow={false} overlayClassName="scope-tooltip">
            <span className="scope-icon-wrapper">{getScopeIcon(variableScope, { showBackgroundColor: false })}</span>
          </Tooltip>
        )}
        <span className="variable-label-wrapper">
          <span className="variable-label">{item.displayName}</span>
          {!item.isNamespace && (
            <span className="variable-meta">
              {variableSourceName ? `${variableSourceName} · ` : ""}
              {variableValue || "No value"}
            </span>
          )}
        </span>
      </div>
      {item.isNamespace ? (
        <RightOutlined className="namespace-chevron" />
      ) : (
        isDynamic && (
          <Tooltip
            title={<DynamicVariableInfoPopover variable={item.variable as DynamicVariable} />}
            placement="rightTop"
            showArrow={false}
            overlayClassName="example-tooltip"
          >
            <InfoCircleOutlined className="info-icon" />
          </Tooltip>
        )
      )}
    </>
  );
};
