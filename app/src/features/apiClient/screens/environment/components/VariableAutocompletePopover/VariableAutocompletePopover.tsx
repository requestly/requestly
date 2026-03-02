import React, { useMemo, useEffect, useRef, memo } from "react";
import { List, Popover } from "antd";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  mergeAndParseAllVariables,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { useCascadingNavigation } from "./hooks/useCascadingNavigation";
import { LeafMainItem } from "./components/LeafMainItem";
import { NamespaceMainItem } from "./components/NamespaceMainItem";
import "./variableAutocompletePopover.scss";

interface VariableAutocompleteProps {
  show: boolean;
  position: { x: number; y: number };
  search: string;
  variables: ScopedVariables | undefined;
  onSelect: (variableKey: string, isDynamic: boolean, isNamespace: boolean) => void;
  onClose?: () => void;
}

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = memo(
  ({ show, position, search, variables, onSelect, onClose }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const onSelectRef = useRef(onSelect);
    useEffect(() => {
      onSelectRef.current = onSelect;
    });

    const allVariables = useMemo(() => {
      return variables ? mergeAndParseAllVariables(variables) : {};
    }, [variables]);

    const filteredVariables = useMemo(() => {
      return getHierarchicalAutocompleteItems(allVariables, search);
    }, [allVariables, search]);

    const {
      selectedIndex,
      setSelectedIndex,
      expandedNamespace,
      submenuSelectedIndex,
      handleSubmenuHover,
      expandedSubNamespace,
      setExpandedSubNamespace,
      subSubmenuSelectedIndex,
      handleSubSubmenuHover,
    } = useCascadingNavigation({ show, filteredVariables, allVariables, onSelect, onClose });

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
                renderItem={(item, index) =>
                  item.isNamespace ? (
                    <NamespaceMainItem
                      key={item.name}
                      item={item}
                      index={index}
                      isSelected={index === selectedIndex}
                      onSelect={(name, isDyn, isNs) => onSelectRef.current(name, isDyn, isNs)}
                      onHover={setSelectedIndex}
                      allVariables={allVariables}
                      isKeyboardExpanded={expandedNamespace === item.name}
                      submenuSelectedIndex={submenuSelectedIndex}
                      onSubmenuHover={handleSubmenuHover}
                      expandedSubNamespace={expandedNamespace === item.name ? expandedSubNamespace : null}
                      onExpandSubNamespace={setExpandedSubNamespace}
                      subSubmenuSelectedIndex={subSubmenuSelectedIndex}
                      onSubSubmenuHover={handleSubSubmenuHover}
                    />
                  ) : (
                    <LeafMainItem
                      key={item.name}
                      item={item}
                      index={index}
                      isSelected={index === selectedIndex}
                      onSelect={(name, isDyn, isNs) => onSelectRef.current(name, isDyn, isNs)}
                      onHover={setSelectedIndex}
                    />
                  )
                }
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
