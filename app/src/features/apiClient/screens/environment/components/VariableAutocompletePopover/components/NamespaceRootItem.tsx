/**
 * NamespaceRootItem — a namespace (expandable) item at the ROOT menu level.
 *
 * See NestedMenuContent.tsx for the full naming-convention reference.
 */
import React, { useState, useCallback } from "react";
import { List, Popover } from "antd";
import { AutocompleteItem, Variables } from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";
import { NestedMenuContent } from "./NestedMenuContent";

interface NamespaceRootItemProps {
  item: AutocompleteItem;
  index: number;
  isSelected: boolean;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
  allVariables: Variables;
  isKeyboardExpanded: boolean;
  submenuSelectedIndex: number;
  onSubmenuHover: (index: number) => void;
  expandedSubNamespace: string | null;
  onExpandSubNamespace: (name: string) => void;
  subSubmenuSelectedIndex: number;
  onSubSubmenuHover: (index: number) => void;
}

export const NamespaceRootItem = React.memo<NamespaceRootItemProps>(
  ({
    item,
    index,
    isSelected,
    onSelect,
    onHover,
    allVariables,
    isKeyboardExpanded,
    submenuSelectedIndex,
    onSubmenuHover,
    expandedSubNamespace,
    onExpandSubNamespace,
    subSubmenuSelectedIndex,
    onSubSubmenuHover,
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleHover = useCallback(() => {
      onHover(index);
    }, [index, onHover]);

    return (
      <Popover
        open={isHovered || isKeyboardExpanded}
        trigger={["hover"]}
        onOpenChange={setIsHovered}
        placement="rightTop"
        overlayClassName="variable-autocomplete-popup variable-autocomplete-submenu"
        overlayInnerStyle={{ padding: 0 }}
        destroyTooltipOnHide
        content={
          <NestedMenuContent
            namespacePath={item.name}
            allVariables={allVariables}
            onSelectLeaf={onSelect}
            selectedIndex={isKeyboardExpanded ? submenuSelectedIndex : undefined}
            onItemHover={isKeyboardExpanded ? onSubmenuHover : undefined}
            expandedChildName={isKeyboardExpanded ? expandedSubNamespace ?? undefined : undefined}
            onExpandChild={isKeyboardExpanded ? onExpandSubNamespace : undefined}
            childSelectedIndex={isKeyboardExpanded ? subSubmenuSelectedIndex : undefined}
            onChildHover={isKeyboardExpanded ? onSubSubmenuHover : undefined}
          />
        }
      >
        <List.Item
          data-index={index}
          className={`variable-autocomplete-item ${isSelected ? "selected" : ""}`}
          onMouseEnter={handleHover}
          style={{ cursor: "pointer" }}
        >
          <VariableRowContent item={item} />
        </List.Item>
      </Popover>
    );
  }
);

NamespaceRootItem.displayName = "NamespaceRootItem";
