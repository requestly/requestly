import React, { memo, useState, useCallback } from "react";
import { List, Popover } from "antd";
import { AutocompleteItem, Variables } from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";
import { SubmenuContent } from "./SubmenuContent";

interface NamespaceMainItemProps {
  item: AutocompleteItem;
  index: number;
  isSelected: boolean;
  onSelect: (name: string, isDynamic: boolean, isNamespace: boolean) => void;
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

export const NamespaceMainItem = memo<NamespaceMainItemProps>(
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
          <SubmenuContent
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

NamespaceMainItem.displayName = "NamespaceMainItem";
