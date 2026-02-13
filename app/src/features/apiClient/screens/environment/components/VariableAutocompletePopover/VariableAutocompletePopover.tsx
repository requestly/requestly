import React, { useCallback, useMemo } from "react";
import { List, Popover, Tooltip } from "antd";
import { createPortal } from "react-dom";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { getAllVariables, checkIsDynamicVariable } from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import "./variableAutocompletePopover.scss";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { capitalize } from "lodash";

interface VariableAutocompleteProps {
  show: boolean;
  position: { x: number; y: number };
  search: string;
  variables: ScopedVariables | undefined;
  onSelect: (variableKey: string, isDynamic: boolean) => void;
}

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = ({
  show,
  position,
  search,
  variables,
  onSelect,
}) => {
  const filteredVariables = useMemo(() => {
    if (!variables) return [];

    // Use unified variable resolution to get all variables (scoped + dynamic)
    // getAllVariables returns scoped variables first, then dynamic variables
    const allVariables = getAllVariables(variables);
    const lowerSearch = search.toLowerCase();

    // Convert to array and filter by search
    return Object.entries(allVariables)
      .map(([key, variable]) => ({
        name: key,
        variable,
      }))
      .filter(({ name }) => name.toLowerCase().includes(lowerSearch));
  }, [variables, search]);

  const handleSelect = useCallback(
    (e: React.MouseEvent, variableName: string, isDynamic: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(variableName, isDynamic);
    },
    [onSelect]
  );

  if (!show || filteredVariables.length === 0) {
    return null;
  }

  const renderListItem = (item: { name: string; variable: any }) => {
    const isDynamic = checkIsDynamicVariable(item.variable);
    const variableName = item.name;
    const variableScope = isDynamic ? item.variable.scope : item.variable[1].scope; // For scoped variables, get scope from source

    return (
      <List.Item
        className="variable-autocomplete-item"
        onMouseDown={(e) => handleSelect(e, variableName, isDynamic)}
        style={{ cursor: "pointer" }}
      >
        <div className="item-left-section">
          <Tooltip
            title={`Scope: ${capitalize(String(variableScope))} environment`}
            placement="top"
            showArrow={false}
            overlayClassName="scope-tooltip"
          >
            <span>{getScopeIcon(variableScope, false)}</span>
          </Tooltip>
          <span className="variable-label">{variableName}</span>
        </div>

        {isDynamic && (
          <Tooltip
            title={<DynamicVariableInfoPopover variable={item.variable as DynamicVariable} />}
            placement="rightTop"
            showArrow={false}
            overlayClassName="example-tooltip"
          >
            <InfoCircleOutlined className="info-icon" />
          </Tooltip>
        )}
      </List.Item>
    );
  };

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: position.y,
    left: position.x,
    zIndex: 9999,
  };

  return createPortal(
    <Popover
      content={<List size="small" dataSource={filteredVariables} renderItem={renderListItem} />}
      open={show}
      destroyTooltipOnHide
      trigger={[]}
      placement="bottomLeft"
      overlayClassName="variable-autocomplete-popup"
      overlayInnerStyle={{ padding: 0 }}
    >
      <div style={popupStyle} />
    </Popover>,
    document.body
  );
};
