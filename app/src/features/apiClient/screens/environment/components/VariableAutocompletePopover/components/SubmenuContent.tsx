import React, { memo, useState, useCallback, useMemo } from "react";
import { List, Popover } from "antd";
import {
  AutocompleteItem,
  Variables,
  checkIsDynamicVariable,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";

interface NamespaceSubmenuItemProps {
  item: AutocompleteItem;
  index: number;
  allVariables: Variables;
  onSelectLeaf: (name: string, isDynamic: boolean, isNamespace: boolean) => void;
  selectedIndex?: number;
  onItemHover?: (index: number) => void;
  isExpanded?: boolean;
  onExpand?: (name: string) => void;
  childSelectedIndex?: number;
  onChildHover?: (index: number) => void;
}

export const NamespaceSubmenuItem = memo<NamespaceSubmenuItemProps>(function NamespaceSubmenuItem({
  item,
  index,
  allVariables,
  onSelectLeaf,
  selectedIndex,
  onItemHover,
  isExpanded,
  onExpand,
  childSelectedIndex,
  onChildHover,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Popover
      open={isHovered || !!isExpanded}
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
          onSelectLeaf={onSelectLeaf}
          selectedIndex={isExpanded ? childSelectedIndex : undefined}
          onItemHover={isExpanded ? onChildHover : undefined}
        />
      }
    >
      <List.Item
        data-index={index}
        className={`variable-autocomplete-item ${selectedIndex === index ? "selected" : ""}`}
        onMouseDown={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onExpand?.(item.name);
        }}
        onMouseEnter={() => onItemHover?.(index)}
        style={{ cursor: "pointer" }}
      >
        <VariableRowContent item={item} />
      </List.Item>
    </Popover>
  );
});

NamespaceSubmenuItem.displayName = "NamespaceSubmenuItem";

interface SubmenuContentProps {
  namespacePath: string;
  allVariables: Variables;
  onSelectLeaf: (name: string, isDynamic: boolean, isNamespace: boolean) => void;
  selectedIndex?: number;
  onItemHover?: (index: number) => void;
  expandedChildName?: string;
  onExpandChild?: (name: string) => void;
  childSelectedIndex?: number;
  onChildHover?: (index: number) => void;
}

export const SubmenuContent = memo<SubmenuContentProps>(function SubmenuContent({
  namespacePath,
  allVariables,
  onSelectLeaf,
  selectedIndex,
  onItemHover,
  expandedChildName,
  onExpandChild,
  childSelectedIndex,
  onChildHover,
}) {
  const [localExpandedChild, setLocalExpandedChild] = useState<string | null>(null);

  const effectiveExpandedChild = expandedChildName ?? localExpandedChild;

  const handleExpand = useCallback(
    (name: string) => {
      if (onExpandChild) {
        onExpandChild(name);
      } else {
        setLocalExpandedChild((prev) => (prev === name ? null : name));
      }
    },
    [onExpandChild]
  );

  const children = useMemo(() => getHierarchicalAutocompleteItems(allVariables, namespacePath + "."), [
    allVariables,
    namespacePath,
  ]);

  if (children.length === 0) return null;

  return (
    <div className="autocomplete-scroll-container" style={{ maxHeight: 300, overflowY: "auto" }}>
      <List
        size="small"
        dataSource={children}
        renderItem={(item, index) => {
          if (item.isNamespace) {
            return (
              <NamespaceSubmenuItem
                key={item.name}
                item={item}
                index={index}
                allVariables={allVariables}
                onSelectLeaf={onSelectLeaf}
                selectedIndex={selectedIndex}
                onItemHover={onItemHover}
                isExpanded={effectiveExpandedChild === item.name}
                onExpand={handleExpand}
                childSelectedIndex={effectiveExpandedChild === item.name ? childSelectedIndex : undefined}
                onChildHover={effectiveExpandedChild === item.name ? onChildHover : undefined}
              />
            );
          }

          const isDynamic = checkIsDynamicVariable(item.variable);
          return (
            <List.Item
              key={item.name}
              data-index={index}
              className={`variable-autocomplete-item ${selectedIndex === index ? "selected" : ""}`}
              onMouseDown={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectLeaf(item.name, isDynamic, false);
              }}
              onMouseEnter={() => onItemHover?.(index)}
              style={{ cursor: "pointer" }}
            >
              <VariableRowContent item={item} />
            </List.Item>
          );
        }}
      />
    </div>
  );
});
