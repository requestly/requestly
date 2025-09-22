import React, { useEffect, useRef } from "react";
import { MdDragIndicator } from "@react-icons/all-files/md/MdDragIndicator";
import { Checkbox, Typography } from "antd";
import { RQAPI } from "features/apiClient/types";
import { useDrag, useDrop } from "react-dnd";
import { CollectionChain } from "./CollectionChain";
import { RequestIcon } from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import { useRunConfigStore } from "features/apiClient/store/collectionRunConfig/runConfigStoreContext.hook";

enum ReorderableItemType {
  REQUEST = "request",
}

type ReorderableItem = {
  draggedIndex: number;
  type: ReorderableItemType.REQUEST;
};

enum DragDirection {
  UP = "up",
  DOWN = "down",
  INITIAL = "initial",
}

const RequestInfo: React.FC<{
  record: RQAPI.ApiRecord;
}> = ({ record }) => {
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

interface ReorderableListItemProps {
  index: number;
  orderedRequest: RQAPI.OrderedRequest;
  style: React.CSSProperties;
  selectAll: { value: boolean };
  reorder: (currentIndex: number, newIndex: number) => void;
}

export const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  index,
  orderedRequest,
  style,
  selectAll,
  reorder,
}) => {
  const [setSelected] = useRunConfigStore((s) => [s.setSelected]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(orderedRequest.record.id, selectAll.value);
  }, [orderedRequest.record.id, selectAll, setSelected]);

  const [{ isDragging }, drag] = useDrag({
    type: ReorderableItemType.REQUEST,

    item: { draggedIndex: index, type: ReorderableItemType.REQUEST },
    collect: (monitor) => {
      return { isDragging: monitor.isDragging() };
    },
  });

  const [{ isOver, isValidTarget, dragDirection }, drop] = useDrop({
    accept: ReorderableItemType.REQUEST,

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
      style={{ opacity: opacity, ...style }}
      className={`reorderable-list-item ${isValidTarget && isOver ? `collect-dragged-item ${dragDirection}` : ""} `}
    >
      <span className="drag-icon">
        <MdDragIndicator />
      </span>

      <Checkbox
        checked={orderedRequest.isSelected}
        onChange={(e) => {
          setSelected(orderedRequest.record.id, e.target.checked);
        }}
      />
      <CollectionChain recordId={orderedRequest.record.id} />
      <RequestInfo record={orderedRequest.record} />
    </div>
  );
};
