import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { AutocompleteItem, checkIsDynamicVariable } from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import { DynamicVariable } from "lib/dynamic-variables/types";

export const VariableRowContent: React.FC<{ item: AutocompleteItem }> = ({ item }) => {
  const isDynamic = checkIsDynamicVariable(item.variable);
  const variableScope = Array.isArray(item.variable) ? item.variable[1].scope : item.variable.scope;

  return (
    <>
      <div className="item-left-section">
        <Tooltip
          title={`Scope: ${capitalize(String(variableScope))} environment`}
          placement="top"
          showArrow={false}
          overlayClassName="scope-tooltip"
        >
          <span className="scope-icon-wrapper">{getScopeIcon(variableScope, { showBackgroundColor: false })}</span>
        </Tooltip>
        <span className="variable-label">{item.displayName}</span>
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
