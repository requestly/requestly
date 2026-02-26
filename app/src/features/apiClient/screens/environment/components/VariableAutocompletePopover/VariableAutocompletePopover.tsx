import React, { useCallback, useMemo, useState, useEffect, useRef, memo } from "react";
import { List, Popover, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  checkIsDynamicVariable,
  mergeAndParseAllVariables,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { capitalize } from "lodash";
import "./variableAutocompletePopover.scss";
interface VariableItemProps {
  item: { name: string; variable: any };
  index: number;
  isSelected: boolean;
  onSelect: (name: string, isDynamic: boolean) => void;
  onHover: (index: number) => void;
}

const VariableItem = memo<VariableItemProps>(({ item, index, isSelected, onSelect, onHover }) => {
  const isDynamic = checkIsDynamicVariable(item.variable);
  const variableScope = Array.isArray(item.variable) ? item.variable[1].scope : item.variable.scope;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(item.name, isDynamic);
    },
    [item.name, isDynamic, onSelect]
  );

  const handleHover = useCallback(() => {
    onHover(index);
  }, [index, onHover]);

  return (
    <List.Item
      data-index={index}
      className={`variable-autocomplete-item ${isSelected ? "selected" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleHover}
      style={{ cursor: "pointer" }}
    >
      <div className="item-left-section">
        <Tooltip
          title={`Scope: ${capitalize(String(variableScope))} environment`}
          placement="top"
          showArrow={false}
          overlayClassName="scope-tooltip"
        >
          <span className="scope-icon-wrapper">
            {getScopeIcon(variableScope, {
              showBackgroundColor: false,
            })}
          </span>
        </Tooltip>

        <span className="variable-label">{item.name}</span>
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
});

VariableItem.displayName = "VariableItem";
interface VariableAutocompleteProps {
  show: boolean;
  position: { x: number; y: number };
  search: string;
  variables: ScopedVariables | undefined;
  onSelect: (variableKey: string, isDynamic: boolean) => void;
  onClose?: () => void;
}

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = memo(
  ({ show, position, search, variables, onSelect, onClose }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const filteredRef = useRef<{ name: string; variable: any }[]>([]);
    const indexRef = useRef(0);
    const onSelectRef = useRef(onSelect);

    useEffect(() => {
      onSelectRef.current = onSelect;
      indexRef.current = selectedIndex;
    });

    const allVariables = useMemo(() => {
      return variables ? mergeAndParseAllVariables(variables) : {};
    }, [variables]);

    const filteredVariables = useMemo(() => {
      const entries = Object.entries(allVariables);

      const lowerSearch = (search || "").toLowerCase();

      return entries
        .map(([key, variable]) => ({ name: key, variable }))
        .filter(({ name }) => name.toLowerCase().includes(lowerSearch));
    }, [allVariables, search]);

    useEffect(() => {
      filteredRef.current = filteredVariables;

      setSelectedIndex(0);
    }, [filteredVariables]);

    useEffect(() => {
      if (!show) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const items = filteredRef.current;
        if (!items.length) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            e.stopPropagation();
            setSelectedIndex((p) => (p + 1) % items.length);
            break;

          case "ArrowUp":
            e.preventDefault();
            e.stopPropagation();
            setSelectedIndex((p) => (p - 1 + items.length) % items.length);
            break;

          case "Enter": {
            e.preventDefault();
            e.stopPropagation();
            const item = items[indexRef.current];
            if (item) {
              onSelectRef.current(item.name, checkIsDynamicVariable(item.variable));
            }
            break;
          }

          case "Escape":
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
            break;
        }
      };
      document.addEventListener("keydown", handleKeyDown, true);

      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }, [show, onClose]);

    useEffect(() => {
      if (!show) return;
      const node = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (node) {
        node.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex, show]);

    return (
      <Popover
        open={show && filteredVariables.length > 0}
        destroyTooltipOnHide
        trigger={[]}
        placement="bottomLeft"
        overlayClassName="variable-autocomplete-popup"
        overlayInnerStyle={{ padding: 0 }}
        content={
          filteredVariables?.length > 0 ? (
            <div ref={listRef} className="autocomplete-scroll-container" style={{ maxHeight: 300, overflowY: "auto" }}>
              <List
                size="small"
                dataSource={filteredVariables}
                renderItem={(item, index) => (
                  <VariableItem
                    item={item}
                    index={index}
                    isSelected={index === selectedIndex}
                    onSelect={(name, isDyn) => onSelectRef.current(name, isDyn)}
                    onHover={setSelectedIndex}
                  />
                )}
              />
            </div>
          ) : null
        }
      >
        <span
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        />
      </Popover>
    );
  }
);
