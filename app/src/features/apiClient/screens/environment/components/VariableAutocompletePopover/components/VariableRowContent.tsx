import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import {
  AutocompleteItem,
  Variable,
  checkIsDynamicVariable,
  checkIsSecretsVariable,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { VariableScope } from "backend/environment/types";

const SCOPE_LABELS: Partial<Record<VariableScope, string>> = {
  [VariableScope.DATA_FILE]: "Data",
  [VariableScope.RUNTIME]: "Runtime",
  [VariableScope.ENVIRONMENT]: "Environment",
  [VariableScope.COLLECTION]: "Collection",
  [VariableScope.GLOBAL]: "Global",
  [VariableScope.DYNAMIC]: "Dynamic",
  [VariableScope.SECRETS]: "Secrets",
};

const getVariableScope = (variable: Variable): VariableScope => {
  return (Array.isArray(variable) ? variable[1].scope : variable.scope) as VariableScope;
};

const getVariableSourceName = (variable: Variable) => {
  if (Array.isArray(variable)) {
    return variable[1].name;
  }

  if (checkIsDynamicVariable(variable)) {
    return "Generated at request time";
  }

  if (checkIsSecretsVariable(variable)) {
    return "Secrets";
  }

  return "";
};

const getVariablePreview = (variable: Variable, isNamespace?: boolean) => {
  if (isNamespace) {
    return "Browse nested variables";
  }

  if (Array.isArray(variable)) {
    const [data] = variable;
    if (data.type === "secret") {
      return "Secret value";
    }

    const value = data.localValue ?? data.syncValue;
    if (value == null || value === "") {
      return "No value";
    }

    return String(value);
  }

  if (checkIsDynamicVariable(variable)) {
    return variable.example ? `Example: ${variable.example}` : variable.description;
  }

  if (checkIsSecretsVariable(variable)) {
    return "Secret value";
  }

  return "";
};

export const VariableRowContent: React.FC<{ item: AutocompleteItem; hideIcon?: boolean }> = ({
  item,
  hideIcon = false,
}) => {
  const isDynamic = checkIsDynamicVariable(item.variable);
  const isSecret = checkIsSecretsVariable(item.variable);
  const variableScope = getVariableScope(item.variable);
  const scopeLabel = isSecret ? SCOPE_LABELS[VariableScope.SECRETS] : SCOPE_LABELS[variableScope];
  const sourceName = getVariableSourceName(item.variable);
  const preview = getVariablePreview(item.variable, item.isNamespace);

  const scopeTooltipTitle = isSecret
    ? "Scope: Secrets"
    : variableScope === VariableScope.DYNAMIC
      ? "Scope: Dynamic"
      : `Scope: ${capitalize(String(variableScope))} environment`;

  return (
    <>
      <div className={`item-left-section ${hideIcon ? "compact" : ""}`}>
        {!hideIcon && (
          <Tooltip title={scopeTooltipTitle} placement="top" showArrow={false} overlayClassName="scope-tooltip">
            <span className="scope-icon-wrapper">{getScopeIcon(variableScope, { showBackgroundColor: false })}</span>
          </Tooltip>
        )}
        <span className="variable-label" title={item.displayName}>
          {item.displayName}
        </span>
        {!hideIcon && (
          <div className="variable-metadata">
            {scopeLabel ? <span className="variable-scope-badge">{scopeLabel}</span> : null}
            {sourceName ? (
              <span className="variable-source-name" title={sourceName}>
                {sourceName}
              </span>
            ) : null}
            {preview ? (
              <span className="variable-value-preview" title={preview}>
                {preview}
              </span>
            ) : null}
          </div>
        )}
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
