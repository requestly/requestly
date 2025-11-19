import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

enum DraggableItemType {
  TAB = "tab",
}

interface DraggableItem {
  tabId: number;
  type: DraggableItemType.TAB;
}

interface DraggableTabProps {
  tabId: number;
  onReorder: (draggedTabId: number, targetTabId: number) => void;
  children: React.ReactNode;
}

export const DraggableTab: React.FC<DraggableTabProps> = ({ tabId, onReorder, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DraggableItemType.TAB,
    item: { tabId, type: DraggableItemType.TAB },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DraggableItemType.TAB,
    drop: (item: DraggableItem) => {
      if (item.tabId !== tabId) {
        onReorder(item.tabId, tabId);
      }
    },
    canDrop: (item: DraggableItem) => {
      return item.tabId !== tabId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.5 : 1;
  const backgroundColor =
    isOver && canDrop ? "var(--requestly-color-white-t-20, rgba(255, 255, 255, 0.12))" : undefined;

  return (
    <div ref={ref} style={{ opacity, backgroundColor, height: "100%", width: "100%" }}>
      {children}
    </div>
  );
};
