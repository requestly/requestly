import React, { memo, useCallback } from "react";
import { List } from "antd";
import { AutocompleteItem, checkIsDynamicVariable } from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";

interface LeafMainItemProps {
  item: AutocompleteItem;
  index: number;
  isSelected: boolean;
  onSelect: (name: string, isDynamic: boolean, isNamespace: boolean) => void;
  onHover: (index: number) => void;
}

export const LeafMainItem = memo<LeafMainItemProps>(({ item, index, isSelected, onSelect, onHover }) => {
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
