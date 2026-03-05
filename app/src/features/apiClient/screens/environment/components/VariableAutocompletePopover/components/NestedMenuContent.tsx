/**
 * NestedMenuContent and its item components.
 *
 * Naming convention for all item components: {Type}{Depth}Item
 *
 *   Type:
 *     Namespace — the item has children (a variable group / namespace path segment).
 *                 Hovering or selecting it opens a deeper NestedMenuContent sub-panel.
 *     Leaf      — the item is a terminal variable with no children.
 *                 Selecting it inserts the variable into the editor.
 *
 *   Depth:
 *     Root      — rendered directly inside the top-level VariableAutocompletePopover.
 *     Nested    — rendered inside a NestedMenuContent sub-panel (level 2 and deeper).
 *
 * Component overview:
 *   VariableAutocompletePopover  (root menu)
 *     ├── NamespaceRootItem       (Namespace + Root)  → opens NestedMenuContent
 *     │     └── NestedMenuContent
 *     │           ├── NamespaceNestedItem  (Namespace + Nested, recursive)
 *     │           │     └── NestedMenuContent
 *     │           │           └── LeafNestedItem
 *     │           └── LeafNestedItem       (Leaf + Nested)
 *     └── LeafRootItem            (Leaf + Root)
 */
import React, { memo, useState, useCallback, useMemo } from "react";
import { List, Popover } from "antd";
import {
  AutocompleteItem,
  Variables,
  getHierarchicalAutocompleteItems,
  getChildSearchPrefix,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";

// ---------------------------------------------------------------------------
// LeafNestedItem — a terminal variable item inside a nested sub-panel.
// ---------------------------------------------------------------------------

interface LeafNestedItemProps {
  item: AutocompleteItem;
  index: number;
  selectedIndex?: number;
  onSelectLeaf: (name: string) => void;
  onItemHover?: (index: number) => void;
}

const LeafNestedItem = memo<LeafNestedItemProps>(function LeafNestedItem({
  item,
  index,
  selectedIndex,
  onSelectLeaf,
  onItemHover,
}) {
  return (
    <List.Item
      data-index={index}
      className={`variable-autocomplete-item ${selectedIndex === index ? "selected" : ""}`}
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectLeaf(item.name);
      }}
      onMouseEnter={() => onItemHover?.(index)}
      style={{ cursor: "pointer" }}
    >
      <VariableRowContent item={item} />
    </List.Item>
  );
});

LeafNestedItem.displayName = "LeafNestedItem";

// ---------------------------------------------------------------------------
// NamespaceNestedItem — an expandable namespace item inside a nested sub-panel.
// Opens a further NestedMenuContent panel on hover/expand.
// ---------------------------------------------------------------------------

interface NamespaceNestedItemProps {
  item: AutocompleteItem;
  index: number;
  allVariables: Variables;
  onSelectLeaf: (name: string) => void;
  selectedIndex?: number;
  onItemHover?: (index: number) => void;
  isExpanded?: boolean;
  onExpand?: (name: string) => void;
  childSelectedIndex?: number;
  onChildHover?: (index: number) => void;
}

export const NamespaceNestedItem = memo<NamespaceNestedItemProps>(function NamespaceNestedItem({
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
        <NestedMenuContent
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

NamespaceNestedItem.displayName = "NamespaceNestedItem";

// ---------------------------------------------------------------------------
// NestedMenuContent — the sub-panel that renders a namespace's children.
// Renders NamespaceNestedItem for groups and LeafNestedItem for variables.
// ---------------------------------------------------------------------------

interface NestedMenuContentProps {
  namespacePath: string;
  allVariables: Variables;
  onSelectLeaf: (name: string) => void;
  selectedIndex?: number;
  onItemHover?: (index: number) => void;
  expandedChildName?: string;
  onExpandChild?: (name: string) => void;
  childSelectedIndex?: number;
  onChildHover?: (index: number) => void;
}

export const NestedMenuContent = memo<NestedMenuContentProps>(function NestedMenuContent({
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

  const children = useMemo(() => getHierarchicalAutocompleteItems(allVariables, getChildSearchPrefix(namespacePath)), [
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
              <NamespaceNestedItem
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

          return (
            <LeafNestedItem
              key={item.name}
              item={item}
              index={index}
              selectedIndex={selectedIndex}
              onSelectLeaf={onSelectLeaf}
              onItemHover={onItemHover}
            />
          );
        }}
      />
    </div>
  );
});
