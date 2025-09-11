import React, { useRef } from "react";
import { Checkbox, Typography } from "antd";
import { MdDragIndicator } from "@react-icons/all-files/md/MdDragIndicator";
import { RQTooltip } from "lib/design-system-v2/components";
import { RequestIcon } from "features/apiClient/screens/apiClient/components/sidebar/components/collectionsList/requestRow/RequestRow";
import "./reOrderableList.scss";
import { RQAPI } from "features/apiClient/types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

const ReOrderableListItem: React.FC<{ id: string; index: number; reOrderRequest: () => void }> = ({
  id,
  index,
  reOrderRequest,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // consume hook here for reactivity

  const [, drop] = useDrop<RQAPI.ApiRecord & { index: number }, void, {}>({
    accept: RQAPI.RecordType.API,
    collect(monitor) {
      return {};
    },

    hover(item: RQAPI.ApiRecord & { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      // @ts-ignore
      reOrderRequest(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: RQAPI.RecordType.API,
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // const opacity = isDragging ? 0 : 1;
  console.log({ isDragging });
  drag(drop(ref));

  return (
    <div ref={ref} className="reOrderable-list-item">
      <span className="drag-icon">
        <MdDragIndicator />
      </span>
      <Checkbox />
      <CollectionPath />

      <RequestInfo
        // @ts-ignore
        record={{ id: "1", name: "Invite user sdsdsd dsdsd dsdsds sdsdsd ", data: { request: { method: "DELETE" } } }}
      />
    </div>
  );
};

export const ReOrderableList: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="reOrderable-list">
        <ReOrderableListItem id="1" index={1} reOrderRequest={() => {}} />
        <ReOrderableListItem id="2" index={2} reOrderRequest={() => {}} />
        <ReOrderableListItem id="3" index={3} reOrderRequest={() => {}} />
      </div>
    </DndProvider>
  );
};
