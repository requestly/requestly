import { MdDragIndicator } from "@react-icons/all-files/md/MdDragIndicator";
import { Checkbox, Typography } from "antd";
import { RequestIcon } from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import { useRecordById } from "features/apiClient/slices";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/types";
import { RQAPI } from "features/apiClient/types";
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useCollectionView } from "../../../../../../collectionView.context";
import { CollectionChain } from "./CollectionChain";
import { getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";

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
  recordId: RQAPI.ApiRecord["id"];
}> = ({ recordId }) => {
  const record = useRecordById(recordId);
  const request = record?.type === RQAPI.RecordType.API ? record : null;

  if (!request) {
    return (
      <div className="request-info-container">
        <Typography.Text className="request-name">Loading...</Typography.Text>
      </div>
    );
  }

  return (
    <div className="request-info-container">
      <RequestIcon record={request} />
      <Typography.Text
        className="request-name"
        ellipsis={{
          tooltip: {
            title: request.name || request.data.request?.url,
            color: "#000",
            placement: "top",
            mouseEnterDelay: 0.5,
          },
        }}
      >
        {request.name || request.data.request?.url}
      </Typography.Text>
    </div>
  );
};

interface ReorderableListItemProps {
  index: number;
  orderedRequest: RQAPI.OrderedRequest;
  reorder: (currentIndex: number, newIndex: number) => void;
}

export const ReorderableListItem: React.FC<ReorderableListItemProps> = ({ index, orderedRequest, reorder }) => {
  const { collectionId } = useCollectionView();

  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const ref = useRef<HTMLDivElement>(null);

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
      style={{ opacity: opacity }}
      className={`reorderable-list-item ${isValidTarget && isOver ? `collect-dragged-item ${dragDirection}` : ""} `}
    >
      <span className="drag-icon">
        <MdDragIndicator />
      </span>

      <Checkbox
        checked={orderedRequest.isSelected}
        onChange={(e) => {
          bufferedEntity.toggleRequestSelection(orderedRequest.record.id);
        }}
      />
      <CollectionChain key={orderedRequest.record.collectionId} recordId={orderedRequest.record.id} />
      <RequestInfo recordId={orderedRequest.record.id} />
    </div>
  );
};
