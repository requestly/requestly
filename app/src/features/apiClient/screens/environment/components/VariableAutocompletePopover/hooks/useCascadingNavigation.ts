import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AutocompleteItem,
  Variables,
  getHierarchicalAutocompleteItems,
  getChildSearchPrefix,
} from "features/apiClient/helpers/variableResolver/variableHelper";

interface UseCascadingNavigationOptions {
  show: boolean;
  filteredVariables: AutocompleteItem[];
  allVariables: Variables;
  onSelect: (variableKey: string) => void;
  onClose?: () => void;
}

// Currently, only handles 2 levels of nesting (main menu → submenu → sub-submenu). It is not optmized for handling multi levels of nesting
export function useCascadingNavigation({
  show,
  filteredVariables,
  allVariables,
  onSelect,
  onClose,
}: UseCascadingNavigationOptions) {
  // selectedIndex: The index of the currently selected item in the main menu
  // expandedMenu: The namespace and index of the currently expanded menu
  // expandedSubMenu: The namespace and index of the currently expanded submenu
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedMenu, setExpandedMenu] = useState<{ namespace: string | null; index: number }>({
    namespace: null,
    index: 0,
  });
  const [expandedSubMenu, setExpandedSubMenu] = useState<{ namespace: string | null; index: number }>({
    namespace: null,
    index: 0,
  });

  const { namespace: expandedNamespace, index: submenuSelectedIndex } = expandedMenu;
  const { namespace: expandedSubNamespace, index: subSubmenuSelectedIndex } = expandedSubMenu;

  const stateRef = useRef({
    selectedIndex,
    expandedMenu,
    expandedSubMenu,
  });
  stateRef.current = {
    selectedIndex,
    expandedMenu,
    expandedSubMenu,
  };

  const filteredRef = useRef(filteredVariables);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const submenuItemsRef = useRef<AutocompleteItem[]>([]);
  const subSubmenuItemsRef = useRef<AutocompleteItem[]>([]);

  const resetAll = useCallback(() => {
    setSelectedIndex(0);
    setExpandedMenu({ namespace: null, index: 0 });
    setExpandedSubMenu({ namespace: null, index: 0 });
  }, []);

  const updateSelectedIndex = useCallback((index: number) => {
    setSelectedIndex(index);
    setExpandedMenu({ namespace: null, index: 0 });
    setExpandedSubMenu({ namespace: null, index: 0 });
  }, []);

  const expandNamespace = useCallback((namespace: string | null) => {
    setExpandedMenu({ namespace, index: 0 });
    setExpandedSubMenu({ namespace: null, index: 0 });
  }, []);

  const updateSubmenuIndex = useCallback((index: number) => {
    setExpandedMenu((prev) => ({ ...prev, index }));
    setExpandedSubMenu({ namespace: null, index: 0 });
  }, []);

  const expandSubNamespace = useCallback((namespace: string | null) => {
    setExpandedSubMenu({ namespace, index: 0 });
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
    return getHierarchicalAutocompleteItems(allVariables, getChildSearchPrefix(expandedNamespace));
  }, [allVariables, expandedNamespace]);

  const subSubmenuItems = useMemo(() => {
    if (!expandedSubNamespace) return [];
    return getHierarchicalAutocompleteItems(allVariables, getChildSearchPrefix(expandedSubNamespace));
  }, [allVariables, expandedSubNamespace]);

  submenuItemsRef.current = submenuItems;
  subSubmenuItemsRef.current = subSubmenuItems;

  useEffect(() => {
    if (!show) {
      return;
    }

    const getActiveLevel = () => {
      const { expandedMenu, expandedSubMenu } = stateRef.current;

      if (expandedMenu.namespace && expandedSubMenu.namespace) {
        return {
          items: subSubmenuItemsRef.current,
          index: expandedSubMenu.index,
          setIndex: (i: number) => setExpandedSubMenu((prev) => ({ ...prev, index: i })),
          expand: null,
          collapse: () => expandSubNamespace(null),
        };
      }
      if (expandedMenu.namespace) {
        return {
          items: submenuItemsRef.current,
          index: expandedMenu.index,
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
    setExpandedSubMenu((prev) => ({ ...prev, index }));
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
