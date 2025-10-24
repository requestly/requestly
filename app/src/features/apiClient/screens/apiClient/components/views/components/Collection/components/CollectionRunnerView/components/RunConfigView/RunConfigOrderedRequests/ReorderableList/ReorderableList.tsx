import React, { useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ReorderableListItem } from "./ReorderableListItem";
import { RQAPI } from "features/apiClient/types";
import "./reorderableList.scss";

interface ReorderableListProps {
  requests: RQAPI.OrderedRequests;
  onOrderUpdate: (updatedList: RQAPI.RunConfig["runOrder"]) => void;
}

export const ReorderableList: React.FC<ReorderableListProps> = ({ requests, onOrderUpdate }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const reorder = useCallback(
    (currentIndex: number, newIndex: number) => {
      if (currentIndex === newIndex) {
        return;
      }

      const result: RQAPI.RunOrder = requests.map((r) => ({ id: r.record.id, isSelected: r.isSelected }));
      const [item] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, item);
      onOrderUpdate(result);
    },
    [requests, onOrderUpdate]
  );

  const rowVirtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  const items = rowVirtualizer.getVirtualItems();

  return (
    <div className="reorderable-list-wrapper">
      <div className="reorderable-list" ref={parentRef}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {items.map((virtualRow) => {
            const orderedRequest = requests[virtualRow.index];
            return (
              <div
                key={orderedRequest.record.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ReorderableListItem index={virtualRow.index} orderedRequest={orderedRequest} reorder={reorder} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
