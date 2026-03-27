/**
 * LeafRootItem — a leaf (terminal variable) item at the ROOT menu level.
 *
 * See NestedMenuContent.tsx for the full naming-convention reference.
 */
import React, { memo, useCallback } from "react";
import { List } from "antd";
import { AutocompleteItem } from "features/apiClient/helpers/variableResolver/variableHelper";
import { VariableRowContent } from "./VariableRowContent";

interface LeafRootItemProps {
  item: AutocompleteItem;
  index: number;
  isSelected: boolean;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
}

export const LeafRootItem = memo<LeafRootItemProps>(({ item, index, isSelected, onSelect, onHover }) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(item.name);
    },
    [item.name, onSelect]
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

LeafRootItem.displayName = "LeafRootItem";
