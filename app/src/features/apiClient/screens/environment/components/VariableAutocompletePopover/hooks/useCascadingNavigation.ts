import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AutocompleteItem,
  Variables,
  checkIsDynamicVariable,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";

interface UseCascadingNavigationOptions {
  show: boolean;
  filteredVariables: AutocompleteItem[];
  allVariables: Variables;
  onSelect: (variableKey: string, isDynamic: boolean, isNamespace: boolean) => void;
  onClose?: () => void;
}

export function useCascadingNavigation({
  show,
  filteredVariables,
  allVariables,
  onSelect,
  onClose,
}: UseCascadingNavigationOptions) {
  // ─── State ──────────────────────────────────────────────────
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedNamespace, setExpandedNamespace] = useState<string | null>(null);
  const [submenuSelectedIndex, setSubmenuSelectedIndex] = useState(0);
  const [expandedSubNamespace, setExpandedSubNamespace] = useState<string | null>(null);
  const [subSubmenuSelectedIndex, setSubSubmenuSelectedIndex] = useState(0);

  // ─── Refs (latest values for the keydown closure) ───────────
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

  // ─── Derived submenu item lists ─────────────────────────────
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

  // ─── Reset effects ──────────────────────────────────────────
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

  const prevSelectedIndex = useRef(selectedIndex);
  useEffect(() => {
    if (prevSelectedIndex.current !== selectedIndex) setExpandedNamespace(null);
    prevSelectedIndex.current = selectedIndex;
  }, [selectedIndex]);

  const prevSubmenuSelectedIndex = useRef(submenuSelectedIndex);
  useEffect(() => {
    if (prevSubmenuSelectedIndex.current !== submenuSelectedIndex) setExpandedSubNamespace(null);
    prevSubmenuSelectedIndex.current = submenuSelectedIndex;
  }, [submenuSelectedIndex]);

  // ─── Keyboard handler ───────────────────────────────────────
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = filteredRef.current;
      if (!items.length) return;

      // Third level: both namespace and sub-namespace expanded
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

      // Second level: namespace expanded
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
            if (subItem?.isNamespace) setExpandedSubNamespace(subItem.name);
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

      // First level: main list
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

  // ─── Hover callbacks ────────────────────────────────────────
  const handleSubmenuHover = useCallback((index: number) => {
    setSubmenuSelectedIndex(index);
  }, []);

  const handleSubSubmenuHover = useCallback((index: number) => {
    setSubSubmenuSelectedIndex(index);
  }, []);

  return {
    selectedIndex,
    setSelectedIndex,
    expandedNamespace,
    submenuSelectedIndex,
    handleSubmenuHover,
    expandedSubNamespace,
    setExpandedSubNamespace,
    subSubmenuSelectedIndex,
    handleSubSubmenuHover,
  };
}
