import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AutocompleteItem,
  Variables,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";

interface UseCascadingNavigationOptions {
  show: boolean;
  filteredVariables: AutocompleteItem[];
  allVariables: Variables;
  onSelect: (variableKey: string) => void;
  onClose?: () => void;
}

// Currently, only handles 2 levels of nesting. It is not optmized for handling multi levels of nesting
export function useCascadingNavigation({
  show,
  filteredVariables,
  allVariables,
  onSelect,
  onClose,
}: UseCascadingNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedNamespace, setExpandedNamespace] = useState<string | null>(null);
  const [submenuSelectedIndex, setSubmenuSelectedIndex] = useState(0);
  const [expandedSubNamespace, setExpandedSubNamespace] = useState<string | null>(null);
  const [subSubmenuSelectedIndex, setSubSubmenuSelectedIndex] = useState(0);

  const stateRef = useRef({
    selectedIndex,
    expandedNamespace,
    submenuSelectedIndex,
    expandedSubNamespace,
    subSubmenuSelectedIndex,
  });
  stateRef.current = {
    selectedIndex,
    expandedNamespace,
    submenuSelectedIndex,
    expandedSubNamespace,
    subSubmenuSelectedIndex,
  };

  const filteredRef = useRef(filteredVariables);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const submenuItemsRef = useRef<AutocompleteItem[]>([]);
  const subSubmenuItemsRef = useRef<AutocompleteItem[]>([]);

  const resetAll = useCallback(() => {
    setSelectedIndex(0);
    setExpandedNamespace(null);
    setSubmenuSelectedIndex(0);
    setExpandedSubNamespace(null);
    setSubSubmenuSelectedIndex(0);
  }, []);

  const updateSelectedIndex = useCallback((index: number) => {
    setSelectedIndex(index);
    setExpandedNamespace(null);
    setSubmenuSelectedIndex(0);
    setExpandedSubNamespace(null);
    setSubSubmenuSelectedIndex(0);
  }, []);

  const expandNamespace = useCallback((namespace: string | null) => {
    setExpandedNamespace(namespace);
    setSubmenuSelectedIndex(0);
    setExpandedSubNamespace(null);
    setSubSubmenuSelectedIndex(0);
  }, []);

  const updateSubmenuIndex = useCallback((index: number) => {
    setSubmenuSelectedIndex(index);
    setExpandedSubNamespace(null);
    setSubSubmenuSelectedIndex(0);
  }, []);

  const expandSubNamespace = useCallback((namespace: string | null) => {
    setExpandedSubNamespace(namespace);
    setSubSubmenuSelectedIndex(0);
  }, []);

  const [prevFilteredVars, setPrevFilteredVars] = useState(filteredVariables);
  if (filteredVariables !== prevFilteredVars) {
    setPrevFilteredVars(filteredVariables);
    filteredRef.current = filteredVariables;
    resetAll();
  }

  const [prevShow, setPrevShow] = useState(show);
  if (show !== prevShow) {
    setPrevShow(show);
    if (!show) resetAll();
  }

  // ─── Derived submenu item lists ─────────────────────────────
  const submenuItems = useMemo(() => {
    if (!expandedNamespace) return [];
    return getHierarchicalAutocompleteItems(allVariables, expandedNamespace + ".");
  }, [allVariables, expandedNamespace]);

  const subSubmenuItems = useMemo(() => {
    if (!expandedSubNamespace) return [];
    return getHierarchicalAutocompleteItems(allVariables, expandedSubNamespace + ".");
  }, [allVariables, expandedSubNamespace]);

  submenuItemsRef.current = submenuItems;
  subSubmenuItemsRef.current = subSubmenuItems;

  useEffect(() => {
    if (!show) {
      return;
    }

    const getActiveLevel = () => {
      const { expandedNamespace, expandedSubNamespace } = stateRef.current;

      if (expandedNamespace && expandedSubNamespace) {
        return {
          items: subSubmenuItemsRef.current,
          index: stateRef.current.subSubmenuSelectedIndex,
          setIndex: (i: number) => setSubSubmenuSelectedIndex(i),
          expand: null,
          collapse: () => expandSubNamespace(null),
        };
      }
      if (expandedNamespace) {
        return {
          items: submenuItemsRef.current,
          index: stateRef.current.submenuSelectedIndex,
          setIndex: (i: number) => updateSubmenuIndex(i),
          expand: (name: string) => expandSubNamespace(name),
          collapse: () => expandNamespace(null),
        };
      }
      return {
        items: filteredRef.current,
        index: stateRef.current.selectedIndex,
        setIndex: (i: number) => updateSelectedIndex(i),
        expand: (name: string) => expandNamespace(name),
        collapse: onClose ?? null,
      };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const level = getActiveLevel();
      if (!level.items.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          level.setIndex((level.index + 1) % level.items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          level.setIndex((level.index - 1 + level.items.length) % level.items.length);
          break;
        case "ArrowRight": {
          const item = level.items[level.index];
          if (item?.isNamespace && level.expand) {
            e.preventDefault();
            e.stopPropagation();
            level.expand(item.name);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          e.stopPropagation();
          const item = level.items[level.index];
          if (item) {
            if (item.isNamespace && level.expand) {
              level.expand(item.name);
            } else if (!item.isNamespace) {
              onSelectRef.current(item.name);
            }
          }
          break;
        }
        case "ArrowLeft":
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          level.collapse?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [show, onClose, updateSelectedIndex, expandNamespace, updateSubmenuIndex, expandSubNamespace]);

  const handleSubmenuHover = useCallback(
    (index: number) => {
      updateSubmenuIndex(index);
    },
    [updateSubmenuIndex]
  );

  const handleSubSubmenuHover = useCallback((index: number) => {
    setSubSubmenuSelectedIndex(index);
  }, []);

  return {
    selectedIndex,
    setSelectedIndex: updateSelectedIndex,
    expandedNamespace,
    submenuSelectedIndex,
    handleSubmenuHover,
    expandedSubNamespace,
    setExpandedSubNamespace: expandSubNamespace,
    subSubmenuSelectedIndex,
    handleSubSubmenuHover,
  };
}
