import React, { useCallback, useMemo, useState, useEffect, useRef, memo } from "react";
import { List, Popover, Tooltip } from "antd";
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  AutocompleteItem,
  Variables,
  checkIsDynamicVariable,
  mergeAndParseAllVariables,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { DynamicVariableInfoPopover } from "../DynamicVariableInfoPopover/DynamicVariableInfoPopover";
import { DynamicVariable } from "lib/dynamic-variables/types";
import { capitalize } from "lodash";
import "./variableAutocompletePopover.scss";

// ─── Shared Row Content ───────────────────────────────────────

const VariableRowContent: React.FC<{ item: AutocompleteItem }> = ({ item }) => {
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

// ─── Namespace item within a submenu (manages hover + click expansion) ───

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

const NamespaceSubmenuItem = memo<NamespaceSubmenuItemProps>(function NamespaceSubmenuItem({
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

// ─── Cascading Submenu (hover + click driven, recursive) ──────────────

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

const SubmenuContent = memo<SubmenuContentProps>(function SubmenuContent({
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

// ─── Main List: Leaf Item ─────────────────────────────────────

interface LeafMainItemProps {
  item: AutocompleteItem;
  index: number;
  isSelected: boolean;
  onSelect: (name: string, isDynamic: boolean, isNamespace: boolean) => void;
  onHover: (index: number) => void;
}

const LeafMainItem = memo<LeafMainItemProps>(({ item, index, isSelected, onSelect, onHover }) => {
  const isDynamic = checkIsDynamicVariable(item.variable);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(item.name, isDynamic, false);
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
      <VariableRowContent item={item} />
    </List.Item>
  );
});

LeafMainItem.displayName = "LeafMainItem";

// ─── Main List: Namespace Item (with cascading submenu) ───────

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

const NamespaceMainItem = memo<NamespaceMainItemProps>(
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

// ─── Main Popover ─────────────────────────────────────────────

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
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [expandedNamespace, setExpandedNamespace] = useState<string | null>(null);
    const [submenuSelectedIndex, setSubmenuSelectedIndex] = useState(0);
    const [expandedSubNamespace, setExpandedSubNamespace] = useState<string | null>(null);
    const [subSubmenuSelectedIndex, setSubSubmenuSelectedIndex] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const filteredRef = useRef<AutocompleteItem[]>([]);
    const indexRef = useRef(0);
    const onSelectRef = useRef(onSelect);
    const expandedRef = useRef<string | null>(null);
    const submenuIndexRef = useRef(0);
    const submenuItemsRef = useRef<AutocompleteItem[]>([]);
    const expandedSubRef = useRef<string | null>(null);
    const subSubmenuIndexRef = useRef(0);
    const subSubmenuItemsRef = useRef<AutocompleteItem[]>([]);

    useEffect(() => {
      onSelectRef.current = onSelect;
      indexRef.current = selectedIndex;
      expandedRef.current = expandedNamespace;
      submenuIndexRef.current = submenuSelectedIndex;
      expandedSubRef.current = expandedSubNamespace;
      subSubmenuIndexRef.current = subSubmenuSelectedIndex;
    });

    const allVariables = useMemo(() => {
      return variables ? mergeAndParseAllVariables(variables) : {};
    }, [variables]);

    const filteredVariables = useMemo(() => {
      return getHierarchicalAutocompleteItems(allVariables, search);
    }, [allVariables, search]);

    const submenuItems = useMemo(() => {
      if (!expandedNamespace) return [];
      return getHierarchicalAutocompleteItems(allVariables, expandedNamespace + ".");
    }, [allVariables, expandedNamespace]);

    const subSubmenuItems = useMemo(() => {
      if (!expandedSubNamespace) return [];
      return getHierarchicalAutocompleteItems(allVariables, expandedSubNamespace + ".");
    }, [allVariables, expandedSubNamespace]);

    useEffect(() => {
      submenuItemsRef.current = submenuItems;
    }, [submenuItems]);

    useEffect(() => {
      subSubmenuItemsRef.current = subSubmenuItems;
    }, [subSubmenuItems]);

    useEffect(() => {
      filteredRef.current = filteredVariables;
      setSelectedIndex(0);
      setExpandedNamespace(null);
    }, [filteredVariables]);

    useEffect(() => {
      if (!show) {
        setExpandedNamespace(null);
        setExpandedSubNamespace(null);
      }
    }, [show]);

    useEffect(() => {
      setSubmenuSelectedIndex(0);
      setExpandedSubNamespace(null);
    }, [expandedNamespace]);

    useEffect(() => {
      setSubSubmenuSelectedIndex(0);
    }, [expandedSubNamespace]);

    // Clear keyboard expansion when the user moves to a different main-list item
    const prevSelectedIndex = useRef(selectedIndex);
    useEffect(() => {
      if (prevSelectedIndex.current !== selectedIndex) {
        setExpandedNamespace(null);
      }
      prevSelectedIndex.current = selectedIndex;
    }, [selectedIndex]);

    // Clear sub-namespace expansion when the user moves to a different submenu item
    const prevSubmenuSelectedIndex = useRef(submenuSelectedIndex);
    useEffect(() => {
      if (prevSubmenuSelectedIndex.current !== submenuSelectedIndex) {
        setExpandedSubNamespace(null);
      }
      prevSubmenuSelectedIndex.current = submenuSelectedIndex;
    }, [submenuSelectedIndex]);

    useEffect(() => {
      if (!show) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const items = filteredRef.current;
        if (!items.length) return;

        // Third level: when both namespace and sub-namespace are keyboard-expanded
        if (expandedRef.current && expandedSubRef.current) {
          const subSubItems = subSubmenuItemsRef.current;

          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              e.stopPropagation();
              if (subSubItems.length) setSubSubmenuSelectedIndex((p) => (p + 1) % subSubItems.length);
              break;

            case "ArrowUp":
              e.preventDefault();
              e.stopPropagation();
              if (subSubItems.length)
                setSubSubmenuSelectedIndex((p) => (p - 1 + subSubItems.length) % subSubItems.length);
              break;

            case "Enter": {
              e.preventDefault();
              e.stopPropagation();
              const subSubItem = subSubItems[subSubmenuIndexRef.current];
              if (subSubItem && !subSubItem.isNamespace) {
                onSelectRef.current(subSubItem.name, checkIsDynamicVariable(subSubItem.variable), false);
              }
              break;
            }

            case "ArrowLeft":
            case "Escape":
              e.preventDefault();
              e.stopPropagation();
              setExpandedSubNamespace(null);
              break;
          }
          return;
        }

        // Second level: when a namespace is keyboard-expanded, route keys to submenu
        if (expandedRef.current) {
          const subItems = submenuItemsRef.current;

          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              e.stopPropagation();
              if (subItems.length) setSubmenuSelectedIndex((p) => (p + 1) % subItems.length);
              break;

            case "ArrowUp":
              e.preventDefault();
              e.stopPropagation();
              if (subItems.length) setSubmenuSelectedIndex((p) => (p - 1 + subItems.length) % subItems.length);
              break;

            case "ArrowRight": {
              e.preventDefault();
              e.stopPropagation();
              const subItem = subItems[submenuIndexRef.current];
              if (subItem?.isNamespace) {
                setExpandedSubNamespace(subItem.name);
              }
              break;
            }

            case "Enter": {
              e.preventDefault();
              e.stopPropagation();
              const subItem = subItems[submenuIndexRef.current];
              if (subItem) {
                if (subItem.isNamespace) {
                  setExpandedSubNamespace(subItem.name);
                } else {
                  onSelectRef.current(subItem.name, checkIsDynamicVariable(subItem.variable), false);
                }
              }
              break;
            }

            case "ArrowLeft":
            case "Escape":
              e.preventDefault();
              e.stopPropagation();
              setExpandedNamespace(null);
              break;
          }
          return;
        }

        // Main list keyboard handling
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

          case "ArrowRight": {
            const item = items[indexRef.current];
            if (item?.isNamespace) {
              e.preventDefault();
              e.stopPropagation();
              setExpandedNamespace(item.name);
            }
            break;
          }

          case "Enter": {
            e.preventDefault();
            e.stopPropagation();
            const item = items[indexRef.current];
            if (item) {
              if (item.isNamespace) {
                setExpandedNamespace(item.name);
              } else {
                onSelectRef.current(item.name, checkIsDynamicVariable(item.variable), false);
              }
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
      return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [show, onClose]);

    useEffect(() => {
      if (!show) return;
      const node = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (node) {
        node.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex, show]);

    const handleSubmenuHover = useCallback((index: number) => {
      setSubmenuSelectedIndex(index);
    }, []);

    const handleSubSubmenuHover = useCallback((index: number) => {
      setSubSubmenuSelectedIndex(index);
    }, []);

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
