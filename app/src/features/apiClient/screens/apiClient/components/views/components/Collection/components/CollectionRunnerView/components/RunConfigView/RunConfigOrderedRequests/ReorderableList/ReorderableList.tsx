import React, { useCallback } from "react";
import { AutoSizer, List, ListRowProps, ListRowRenderer } from "react-virtualized";
import { ReorderableListItem } from "./ReorderableListItem";
import { RQAPI } from "features/apiClient/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "react-virtualized/styles.css";
import "./reorderableList.scss";

interface ReorderableListProps {
  requests: RQAPI.OrderedRequests;
  onOrderUpdate: (updatedList: RQAPI.RunConfig["runOrder"]) => void;
}

export const ReorderableList: React.FC<ReorderableListProps> = ({ requests, onOrderUpdate }) => {
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

  const rowRenderer: ListRowRenderer = useCallback(
    (props: ListRowProps): React.ReactNode => {
      const orderedRequest = requests[props.index];

      return (
        <ReorderableListItem
          key={orderedRequest.record.id}
          index={props.index}
          orderedRequest={orderedRequest}
          reorder={reorder}
          style={props.style}
        />
      );
    },
    [reorder, requests]
  );

  return (
    <div className="reorderable-list">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List height={height} width={width} rowCount={requests.length} rowHeight={32} rowRenderer={rowRenderer} />
          );
        }}
      </AutoSizer>
    </div>
  );
};
