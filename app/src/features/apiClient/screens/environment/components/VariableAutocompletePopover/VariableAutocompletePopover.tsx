import React, { useMemo, useRef, memo, useEffect } from "react";
import { List, Popover } from "antd";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  mergeAndParseAllVariables,
  getHierarchicalAutocompleteItems,
} from "features/apiClient/helpers/variableResolver/variableHelper";
import { useCascadingNavigation } from "./hooks/useCascadingNavigation";
import { LeafRootItem } from "./components/LeafRootItem";
import { NamespaceRootItem } from "./components/NamespaceRootItem";
import "./variableAutocompletePopover.scss";
import { SPECIAL_VARIABLE_MODES } from "./variableModeConfig";
import AutoCompleteSecretEmptyState from "./components/EmptyStates";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

interface VariableAutocompleteProps {
  show: boolean;
  position: { x: number; y: number };
  search: string;
  variables: ScopedVariables | undefined;
  onSelect: (variableKey: string) => void;
  onClose?: () => void;
}

const SecretsDefaultFooter: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  if (!isFeatureCompatible(FEATURES.SECRETS_MANAGER)) {
    return null;
  }

  return (
    <div className="secrets-hint-footer" onClick={onClose}>
      Type &ldquo;secrets:&rdquo; to use secrets in requests
    </div>
  );
};

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = memo(
  ({ show, position, search, variables, onSelect, onClose }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const onSelectRef = useRef(onSelect);

    useEffect(() => {
      onSelectRef.current = onSelect;
    }, [onSelect]);

    // Detect active mode based on search prefix
    const activeMode = useMemo(() => {
      const normalizedSearch = (search ?? "").toLowerCase();
      return Object.entries(SPECIAL_VARIABLE_MODES).find(([_, config]) =>
        normalizedSearch.startsWith(config.prefix + config.separator)
      );
    }, [search]);

    const allVariables = useMemo(() => {
      return variables ? mergeAndParseAllVariables(variables) : {};
    }, [variables]);

    // Filter variables based on active mode
    const filteredVariables = useMemo(() => {
      const items = getHierarchicalAutocompleteItems(allVariables, search);

      if (activeMode) {
        // In special mode: only show variables of that type
        const [_, config] = activeMode;
        return items.filter((item) => config.checkFunction(item.variable));
      }

      // In default mode: filter out all special variable types
      return items.filter(
        (item) => !Object.values(SPECIAL_VARIABLE_MODES).some((config) => config.checkFunction(item.variable))
      );
    }, [allVariables, search, activeMode]);

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
      if (!show) {
        return;
      }
      const node = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (node) {
        node.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex, show]);

    const shouldShow = show && (filteredVariables.length > 0 || !!activeMode);

    // Get the appropriate footer component
    const FooterComponent = activeMode ? activeMode[1].FooterComponent : SecretsDefaultFooter;

    // Custom empty state for secrets mode
    const emptyState =
      activeMode && filteredVariables.length === 0 ? <AutoCompleteSecretEmptyState onClose={onClose} /> : null;

    return (
      <Popover
        open={shouldShow}
        destroyTooltipOnHide
        trigger={[]}
        placement="bottomLeft"
        overlayClassName="variable-autocomplete-popup"
        overlayInnerStyle={{ padding: 0 }}
        content={
          emptyState || (
            <div>
              {filteredVariables.length > 0 && (
                <div
                  ref={listRef}
                  className="autocomplete-scroll-container"
                  style={{ maxHeight: 300, overflowY: "auto" }}
                >
                  <List
                    size="small"
                    dataSource={filteredVariables}
                    locale={{ emptyText: null }}
                    renderItem={(item, index) =>
                      item.isNamespace ? (
                        <NamespaceRootItem
                          key={item.name}
                          item={item}
                          index={index}
                          isSelected={index === selectedIndex}
                          onSelect={(name) => onSelectRef.current(name)}
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
                        <LeafRootItem
                          key={item.name}
                          item={item}
                          index={index}
                          isSelected={index === selectedIndex}
                          onSelect={(name) => onSelectRef.current(name)}
                          onHover={setSelectedIndex}
                        />
                      )
                    }
                  />
                </div>
              )}

              <FooterComponent onClose={onClose} />
            </div>
          )
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
