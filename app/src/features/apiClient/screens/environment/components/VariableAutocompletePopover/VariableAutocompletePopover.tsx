import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { List, Popover, Tooltip } from "antd";
import { createPortal } from "react-dom";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  checkIsDynamicVariable,
  mergeAndParseAllVariables,
} from "features/apiClient/helpers/variableResolver/variableHelper";
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
  onClose?: () => void;
}

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = ({
  show,
  position,
  search,
  variables,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);

  // Keep ref in sync
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const filteredVariables = useMemo(() => {
    if (!variables) return [];

    const lowerSearch = search.toLowerCase();
    const hasDynamicPrefix = lowerSearch.startsWith("$");
    const allVariables = mergeAndParseAllVariables(variables);

    // Convert to array and filter by search
    let results = Object.entries(allVariables)
      .map(([key, variable]) => ({
        name: key,
        variable,
      }))
      .filter(({ name }) => {
        const lowerName = name.toLowerCase();
        const searchWithoutPrefix = hasDynamicPrefix ? lowerSearch.substring(1) : lowerSearch;
        const nameWithoutPrefix = lowerName.startsWith("$") ? lowerName.substring(1) : lowerName;
        return nameWithoutPrefix.includes(searchWithoutPrefix);
      });

    // Show only dynamic variables when user explicitly types "$" prefix
    if (hasDynamicPrefix) {
      // Show only dynamic variables (check scope attribute)
      results = results.filter(({ variable }) => checkIsDynamicVariable(variable));
    } else {
      // Show only scoped variables (filter out dynamic ones)
      results = results.filter(({ variable }) => !checkIsDynamicVariable(variable));
    }

    return results;
  }, [variables, search]);

  // Keyboard navigation and auto-scroll
  useEffect(() => {
    if (!show) return;
    setSelectedIndex(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      const len = filteredVariables.length;
      if (!len) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % len);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + len) % len);
          break;
        case "Enter": {
          e.preventDefault();
          const item = filteredVariables[selectedIndexRef.current];
          if (item) onSelect(item.name, checkIsDynamicVariable(item.variable));
          break;
        }
        case "Escape":
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, filteredVariables, onSelect, onClose]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (e: React.MouseEvent, variableName: string, isDynamic: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(variableName, isDynamic);
    },
    [onSelect]
  );

  const renderListItem = useCallback(
    (item: { name: string; variable: any }, index: number) => {
      const isDynamic = checkIsDynamicVariable(item.variable);
      const variableName = item.name;
      const variableScope = isDynamic ? item.variable.scope : item.variable[1].scope;
      const isSelected = index === selectedIndex;

      return (
        <List.Item
          className={`variable-autocomplete-item ${isSelected ? "selected" : ""}`}
          onMouseDown={(e) => handleSelect(e, variableName, isDynamic)}
          onMouseEnter={() => setSelectedIndex(index)}
          style={{ cursor: "pointer" }}
          data-index={index}
        >
          <div className="item-left-section">
            <Tooltip
              title={`Scope: ${capitalize(String(variableScope))} environment`}
              placement="top"
              showArrow={false}
              overlayClassName="scope-tooltip"
            >
              <span>{getScopeIcon(variableScope, { showBackgroundColor: false })}</span>
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
    },
    [selectedIndex, handleSelect]
  );

  if (!show || filteredVariables.length === 0) {
    return null;
  }

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: position.y,
    left: position.x,
    zIndex: 9999,
  };

  return createPortal(
    <Popover
      content={
        <div ref={listRef}>
          <List size="small" dataSource={filteredVariables} renderItem={renderListItem} />
        </div>
      }
      open={true}
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
