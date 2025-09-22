import React, { useCallback } from "react";
import { AutoSizer, List, ListRowProps, ListRowRenderer } from "react-virtualized";
import { ReorderableListItem } from "./ReorderableListItem";
import { RQAPI } from "features/apiClient/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "react-virtualized/styles.css";
import "./reorderableList.scss";

interface ReorderableListProps {
  isSelectAll: boolean;
  requests: RQAPI.ApiRecord[];
  onOrderUpdate: (updatedList: RQAPI.ApiRecord[]) => void;
}

export const ReorderableList: React.FC<ReorderableListProps> = ({ isSelectAll, requests, onOrderUpdate }) => {
  const reorder = useCallback(
    (currentIndex: number, newIndex: number) => {
      if (currentIndex === newIndex) {
        return;
      }

      const result = [...requests];
      const [item] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, item);
      onOrderUpdate(result);
    },
    [requests, onOrderUpdate]
  );

  const rowRenderer: ListRowRenderer = useCallback(
    (props: ListRowProps): React.ReactNode => {
      const record = requests[props.index];

      return (
        <ReorderableListItem
          key={props.key}
          index={props.index}
          record={record}
          reorder={reorder}
          style={props.style}
          isSelectAll={isSelectAll}
        />
      );
    },
    [reorder, requests, isSelectAll]
  );

  return (
    <div className="reorderable-list">
      <DndProvider backend={HTML5Backend}>
        <AutoSizer>
          {({ height, width }) => {
            return (
              <List height={height} width={width} rowCount={requests.length} rowHeight={32} rowRenderer={rowRenderer} />
            );
          }}
        </AutoSizer>
      </DndProvider>
    </div>
  );
};
