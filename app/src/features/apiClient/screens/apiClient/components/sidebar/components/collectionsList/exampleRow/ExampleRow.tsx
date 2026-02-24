import React, { useCallback, useMemo, useRef, useState } from "react";
import { Typography, Dropdown, MenuProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { MdOutlineDashboard } from "@react-icons/all-files/md/MdOutlineDashboard";
import { Conditional } from "components/common/Conditional";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { ExampleViewTabSource } from "../../../../views/components/ExampleRequestView/exampleViewTabSource";
import { useActiveTab, useTabActions } from "componentsV2/Tabs/slice";
import {
  ApiClientFeatureContext,
  createExampleRequest,
  updateExampleRequest,
  useApiClientFeatureContext,
} from "features/apiClient/slices";
import { MdContentCopy } from "@react-icons/all-files/md/MdContentCopy";
import { toast } from "utils/Toast";
import { useDrag, useDrop } from "react-dnd";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { getRankForDroppedExample } from "features/apiClient/helpers/RankingManager/utils";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";
import clsx from "clsx";
import "./ExampleRow.scss";

interface Props {
  record: RQAPI.ExampleApiRecord;
  isReadOnly: boolean;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context?: ApiClientFeatureContext) => void;
}

export const ExampleRow: React.FC<Props> = ({ record, isReadOnly, handleRecordsToBeDeleted }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const dropPositionRef = useRef<"before" | "after" | null>(null);
  const exampleRowRef = useRef<HTMLDivElement>(null);

  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();
  const activeTabSourceId = useActiveTab()?.source.getSourceId();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RQAPI.RecordType.EXAMPLE_API,
      item: { record, parentRequestId: record.parentRequestId },
      canDrag: () => !isReadOnly && isFeatureCompatible(FEATURES.API_CLIENT_RECORDS_REORDERING),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [record, isReadOnly]
  );

  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.EXAMPLE_API],
      canDrop: (item: { record: RQAPI.ExampleApiRecord; parentRequestId: string }) => {
        if (isReadOnly) return false;
        if (item.record.id === record.id) return false;
        if (item.parentRequestId !== record.parentRequestId) return false;
        if (!isFeatureCompatible(FEATURES.API_CLIENT_RECORDS_REORDERING)) return false;
        return true;
      },
      hover: (item: { record: RQAPI.ExampleApiRecord; parentRequestId: string }, monitor) => {
        if (!monitor.isOver({ shallow: true }) || !isFeatureCompatible(FEATURES.API_CLIENT_RECORDS_REORDERING)) {
          return;
        }

        const hoverBoundingRect = monitor.getClientOffset();
        const targetElement = exampleRowRef.current;

        if (hoverBoundingRect && targetElement) {
          const targetRect = targetElement.getBoundingClientRect();
          const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
          const hoverClientY = hoverBoundingRect.y - targetRect.top;
          const pos = hoverClientY < hoverMiddleY ? "before" : "after";
          setDropPosition(pos);
          dropPositionRef.current = pos;
        }
      },
      drop: async (item: { record: RQAPI.ExampleApiRecord; parentRequestId: string }, monitor) => {
        if (!monitor.isOver({ shallow: true })) {
          setDropPosition(null);
          dropPositionRef.current = null;
          return;
        }

        const currentDropPosition = dropPositionRef.current;
        setDropPosition(null);
        dropPositionRef.current = null;

        try {
          const rank = getRankForDroppedExample({
            context,
            targetExample: record,
            droppedExample: item.record,
            dropPosition: currentDropPosition,
          });

          await context.store
            .dispatch(
              updateExampleRequest({
                example: { ...item.record, rank },
                repository: context.repositories.apiClientRecordsRepository,
              }) as any
            )
            .unwrap();
        } catch (error) {
          toast.error("Failed to reorder example");
        }
      },
      collect: (monitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [record, context, isReadOnly]
  );

  React.useEffect(() => {
    if (!isOverCurrent && (dropPosition !== null || dropPositionRef.current !== null)) {
      setDropPosition(null);
      dropPositionRef.current = null;
    }
  }, [isOverCurrent, dropPosition]);

  const handleDuplicateExample = useCallback(async () => {
    try {
      const rank = apiRecordsRankingManager.getRankForDuplicatedRecord(context, record, record.parentRequestId);
      const { exampleRecord } = await context.store
        .dispatch(
          createExampleRequest({
            parentRequestId: record.parentRequestId,
            example: {
              ...record,
              name: `${record.name} Copy`,
              rank,
            },
            repository: context.repositories.apiClientRecordsRepository,
          }) as any
        )
        .unwrap();

      openBufferedTab({
        source: new ExampleViewTabSource({
          id: exampleRecord.id,
          apiEntryDetails: exampleRecord,
          title: exampleRecord.name || "Example",
          context: {
            id: context.workspaceId,
          },
        }),
      });

      toast.success("Example duplicated successfully");
    } catch {
      toast.error("Something went wrong while duplicating the example.");
    }
  }, [context, record, openBufferedTab]);

  const exampleOptions = useMemo((): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: (
          <div>
            <MdOutlineBorderColor style={{ marginRight: 8 }} />
            Rename
          </div>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsEditMode(true);
          setIsDropdownVisible(false);
        },
      },
      {
        key: "1",
        label: (
          <div>
            <MdContentCopy style={{ marginRight: 8 }} />
            Duplicate
          </div>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsDropdownVisible(false);
          handleDuplicateExample();
        },
      },
      {
        key: "2",
        label: (
          <div>
            <MdOutlineDelete style={{ marginRight: 8 }} />
            Delete
          </div>
        ),
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsDropdownVisible(false);
          handleRecordsToBeDeleted([record], context);
        },
      },
    ];
  }, [handleDuplicateExample, handleRecordsToBeDeleted, record, context]);

  if (isEditMode) {
    return (
      <NewRecordNameInput
        analyticEventSource="example_row"
        recordType={RQAPI.RecordType.EXAMPLE_API}
        recordToBeEdited={record}
        onSuccess={() => {
          setIsEditMode(false);
        }}
      />
    );
  }

  return (
    <div
      className={clsx("example-row-wrapper", {
        "example-drop-before": dropPosition === "before",
        "example-drop-after": dropPosition === "after",
      })}
      ref={(node) => {
        exampleRowRef.current = node;
        drag(node);
        drop(node);
      }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className={`collections-list-item api example-row ${record.id === activeTabSourceId ? "active" : ""}`}
        onClick={() => {
          openBufferedTab({
            source: new ExampleViewTabSource({
              id: record.id,
              apiEntryDetails: record,
              title: record.name || "Example",
              context: {
                id: context.workspaceId,
              },
            }),
          });
        }}
      >
        <div style={{ width: 8 }} />
        <MdOutlineDashboard className="example-row-icon" />
        <Typography.Text
          ellipsis={{
            tooltip: {
              title: record.name || "Example",
              placement: "right",
              color: "#000",
              mouseEnterDelay: 0.5,
            },
          }}
          className="request-url example-row-name"
        >
          {record.name || "Example"}
        </Typography.Text>

        <Conditional condition={!isReadOnly}>
          <div className={`request-options ${isDropdownVisible ? "active" : ""}`}>
            <Dropdown
              trigger={["click"]}
              menu={{ items: exampleOptions }}
              placement="bottomRight"
              open={isDropdownVisible}
              onOpenChange={setIsDropdownVisible}
            >
              <RQButton
                onClick={(e) => {
                  e.stopPropagation();
                }}
                size="small"
                type="transparent"
                icon={<MdOutlineMoreHoriz />}
              />
            </Dropdown>
          </div>
        </Conditional>
      </div>
    </div>
  );
};
