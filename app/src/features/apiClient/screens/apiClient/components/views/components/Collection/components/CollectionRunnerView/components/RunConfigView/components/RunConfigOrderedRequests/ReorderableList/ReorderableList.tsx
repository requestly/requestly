import React, { useCallback, useRef, useState } from "react";
import { Checkbox, Typography } from "antd";
import { MdDragIndicator } from "@react-icons/all-files/md/MdDragIndicator";
import { RQTooltip } from "lib/design-system-v2/components";
import { RequestIcon } from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import { RQAPI } from "features/apiClient/types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./reorderableList.scss";

const CollectionPath: React.FC = () => {
  const collections = [
    { id: "1", name: "C1" },
    { id: "2", name: "C2" },
    { id: "3", name: "C3" },
  ];

  return (
    <div className="collection-path-container">
      {collections.map((c, index) => {
        return (
          <div key={c.id} className="collection-path-item">
            <RQTooltip showArrow={false} title={c.name}>
              <img
                width={16}
                height={16}
                alt="collection icon"
                className="collection-icon"
                src={"/assets/media/apiClient/folder-more-line.svg"}
              />
            </RQTooltip>

            {index === collections.length - 1 ? null : <span className="separator">/</span>}
          </div>
        );
      })}
    </div>
  );
};

const RequestInfo: React.FC<{ record: RQAPI.ApiRecord }> = ({ record }) => {
  return (
    <div className="request-info-container">
      <RequestIcon record={record} />
      <Typography.Text
        className="request-name"
        ellipsis={{
          tooltip: {
            title: record.name || record.data.request?.url,
            color: "#000",
            placement: "top",
            mouseEnterDelay: 0.5,
          },
        }}
      >
        {record.name || record.data.request?.url}
      </Typography.Text>
    </div>
  );
};

enum ReorderableItemType {
  REORDERABLE_ITEM = "reorderableItem",
}

type ReorderableItem = {
  draggedIndex: number;
  type: ReorderableItemType.REORDERABLE_ITEM;
};

enum DragDirection {
  UP = "up",
  DOWN = "down",
  INITIAL = "initial",
}

const ReorderableListItem: React.FC<{
  index: number;
  record: RQAPI.ApiRecord;
  reorder: (currentIndex: number, newIndex: number) => void;
}> = ({ index, record, reorder }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ReorderableItemType.REORDERABLE_ITEM,

    item: { draggedIndex: index, type: ReorderableItemType.REORDERABLE_ITEM },
    collect: (monitor) => {
      return { isDragging: monitor.isDragging() };
    },
  });

  const [{ isOver, isValidTarget, dragDirection }, drop] = useDrop({
    accept: ReorderableItemType.REORDERABLE_ITEM,

    drop(item: ReorderableItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.draggedIndex;
      const hoverIndex = index;
      reorder(dragIndex, hoverIndex);
    },

    canDrop: (item: ReorderableItem) => {
      return item.draggedIndex !== index;
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isValidTarget: monitor.canDrop(),
      dragDirection:
        monitor.getItem()?.draggedIndex !== index
          ? monitor.getItem()?.draggedIndex > index
            ? DragDirection.UP
            : DragDirection.DOWN
          : DragDirection.INITIAL,
    }),
  });

  drag(drop(ref));
  const opacity = isDragging ? 0.5 : 1;

  return (
    <div
      ref={ref}
      style={{ opacity: opacity }}
      className={`reorderable-list-item ${isValidTarget && isOver ? `collect-dragged-item ${dragDirection}` : ""} `}
    >
      <span className="drag-icon">
        <MdDragIndicator />
      </span>
      <Checkbox />
      <CollectionPath />
      <RequestInfo record={record} />
    </div>
  );
};

export const ReorderableList: React.FC = () => {
  const [requests, setRequests] = useState([
    { id: "1", name: "Invite user", data: { request: { method: "GET" } } },
    { id: "2", name: "Delete user invite", data: { request: { method: "DELETE" } } },
    { id: "3", name: "Add new user invite", data: { request: { method: "POST" } } },
    { id: "4", name: "Add new user invite", data: { request: { method: "POST" } } },
    { id: "5", name: "Delete user invite", data: { request: { method: "DELETE" } } },
    { id: "6", name: "Add new user invite", data: { request: { method: "POST" } } },
    { id: "7", name: "Add new user invite", data: { request: { method: "POST" } } },
    { id: "8", name: "Update user invite", data: { request: { method: "PUT" } } },
    { id: "9", name: "Update user invite", data: { request: { method: "PUT" } } },
  ]);

  const reorder = useCallback(
    (currentIndex: number, newIndex: number) => {
      if (currentIndex === newIndex) {
        return requests;
      }

      const result = [...requests];
      const [item] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, item);
      setRequests(result);
    },
    [requests]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="reorderable-list">
        {requests.map((record, index) => {
          return (
            <ReorderableListItem
              key={record.id}
              index={index}
              // @ts-ignore
              record={record}
              reorder={reorder}
            />
          );
        })}
      </div>
    </DndProvider>
  );
};
