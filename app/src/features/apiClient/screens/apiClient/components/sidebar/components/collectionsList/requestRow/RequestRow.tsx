import React, { useCallback, useMemo, useRef, useState } from "react";
import { Typography, Dropdown, MenuProps, Checkbox, notification } from "antd";
import { REQUEST_METHOD_BACKGROUND_COLORS, REQUEST_METHOD_COLORS } from "../../../../../../../../../constants";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import {
  trackDuplicateRequestClicked,
  trackDuplicateRequestFailed,
  trackMoveRequestToCollectionClicked,
  trackRequestDuplicated,
} from "modules/analytics/events/features/apiClient";
import { LocalWorkspaceTooltip } from "../../../../views/components/LocalWorkspaceTooltip/LocalWorkspaceTooltip";
import "./RequestRow.scss";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdContentCopy } from "@react-icons/all-files/md/MdContentCopy";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { MdMoveDown } from "@react-icons/all-files/md/MdMoveDown";
import { Conditional } from "components/common/Conditional";
import { RequestViewTabSource } from "../../../../views/components/RequestView/requestViewTabSource";
import { useDrag, useDrop } from "react-dnd";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { isGraphQLApiRecord, isHttpApiRecord } from "features/apiClient/screens/apiClient/utils";
import { ApiClientFeatureContext, useApiClientRepository, useApiClientFeatureContext } from "features/apiClient/slices";
import { useActiveTab, useTabActions } from "componentsV2/Tabs/slice";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";
import { ApiClientSidebarCollapse } from "../apiClientSidebarCollapse/ApiClientSidebarCollapse";
import { ExampleRow } from "../exampleRow/ExampleRow";
import { useCollapsibleRow } from "../../../../../../../hooks/useCollapsibleRow";

import clsx from "clsx";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { getRankForDroppedRecord } from "features/apiClient/helpers/RankingManager/utils";

interface Props {
  record: RQAPI.ApiRecord;
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.ApiClientRecord["id"]>;
    recordsSelectionHandler: (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
  expandedRecordIds?: string[];
  setExpandedRecordIds?: (keys: RQAPI.ApiClientRecord["id"][]) => void;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context?: ApiClientFeatureContext) => void;
  onItemClick?: (record: RQAPI.ApiClientRecord, event: React.MouseEvent) => void;
}

export const HttpMethodIcon = ({ method }: { method: RequestMethod }) => {
  return (
    <Typography.Text
      strong
      className="request-method"
      style={{
        color: REQUEST_METHOD_COLORS[method],
        backgroundColor: REQUEST_METHOD_BACKGROUND_COLORS[method],
      }}
    >
      {[RequestMethod.OPTIONS, RequestMethod.DELETE].includes(method) ? method.slice(0, 3) : method}
    </Typography.Text>
  );
};

export const GraphQlIcon = () => <GrGraphQl className="graphql-request-icon" />;

export const RequestIcon = ({ record }: { record: RQAPI.ApiRecord }) => {
  if (!record?.data) {
    return null;
  }
  if (isHttpApiRecord(record)) {
    return <HttpMethodIcon method={record.data.request?.method} />;
  } else if (isGraphQLApiRecord(record)) {
    return <GraphQlIcon />;
  } else {
    return null;
  }
};

export const RequestRow: React.FC<Props> = ({
  record,
  isReadOnly,
  bulkActionOptions,
  expandedRecordIds = [],
  setExpandedRecordIds,
  handleRecordsToBeDeleted,
  onItemClick,
}) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [recordToMove, setRecordToMove] = useState<RQAPI.ApiRecord | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const [isDropProcessing, setIsDropProcessing] = useState(false);
  const dropPositionRef = useRef<"before" | "after" | null>(null);
  const requestRowRef = useRef<HTMLDivElement>(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const workspaceId = useWorkspaceId();
  const { openBufferedTab } = useTabActions();
  const { onSaveRecord } = useNewApiClientContext();
  const context = useApiClientFeatureContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const activeTabSourceId = useActiveTab()?.source.getSourceId();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RQAPI.RecordType.API,
      item: {
        record,
        workspaceId,
        onDropComplete: () => setIsDropProcessing(false),
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (monitor.didDrop()) {
          setIsDropProcessing(true);
        }
      },
    }),
    [record, workspaceId]
  );
  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.API],
      canDrop: (item: { record: RQAPI.ApiClientRecord; contextId: string; onDropComplete?: () => void }) => {
        if (isReadOnly) return false;

        if (item.record.id === record.id) return false;
        if (!isFeatureCompatible(FEATURES.API_CLIENT_RECORDS_REORDERING)) {
          return false;
        }
        return true;
      },
      hover: (item: { record: RQAPI.ApiClientRecord; contextId: string; onDropComplete?: () => void }, monitor) => {
        if (!monitor.isOver({ shallow: true }) || !isFeatureCompatible(FEATURES.API_CLIENT_RECORDS_REORDERING)) {
          return;
        }

        const hoverBoundingRect = monitor.getClientOffset();
        const targetElement = requestRowRef.current;

        if (hoverBoundingRect && targetElement) {
          const targetRect = targetElement.getBoundingClientRect();
          const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
          const hoverClientY = hoverBoundingRect.y - targetRect.top;
          const dropPosition = hoverClientY < hoverMiddleY ? "before" : "after";
          setDropPosition(dropPosition);
          dropPositionRef.current = dropPosition;
        }
      },
      drop: async (
        item: { record: RQAPI.ApiClientRecord; contextId: string; onDropComplete?: () => void },
        monitor
      ) => {
        if (!monitor.isOver({ shallow: true })) {
          setDropPosition(null);
          dropPositionRef.current = null;
          return;
        }

        const currentDropPosition = dropPositionRef.current;
        setDropPosition(null);
        dropPositionRef.current = null;

        try {
          const rank = getRankForDroppedRecord({
            context,
            targetRecord: record,
            droppedRecord: item.record,
            dropPosition: currentDropPosition,
          });
          const targetCollectionId = record.collectionId;
          if (item.record.type === RQAPI.RecordType.COLLECTION) {
            return;
          }
          const patch: Partial<RQAPI.ApiRecord> = {
            data: {
              ...item.record.data,
            },
            id: item.record.id,
            rank,
            collectionId: targetCollectionId,
          };

          const result = await apiClientRecordsRepository.updateRecord(patch, item.record.id);

          if (result.success) {
            onSaveRecord(result.data);
          } else {
            throw new Error("Failed to move record");
          }
        } catch (error) {
          notification.error({
            message: "Error moving record",
            description: error?.message || "Unexpected error. Please contact support.",
            placement: "bottomRight",
          });
        } finally {
          item.onDropComplete?.();
        }
      },
      collect: (monitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [record, workspaceId, dropPosition, apiClientRecordsRepository, context]
  );

  // Clear drop position when no longer hovering
  React.useEffect(() => {
    if (!isOverCurrent && (dropPosition !== null || dropPositionRef.current !== null)) {
      setDropPosition(null);
      dropPositionRef.current = null;
    }
  }, [isOverCurrent, dropPosition]);

  const handleDropdownVisibleChange = (isOpen: boolean) => {
    setIsDropdownVisible(isOpen);
  };

  const handleDuplicateRequest = useCallback(
    async (record: RQAPI.ApiRecord) => {
      const { id, ...rest } = record;

      // Generate rank for the duplicated request to place it immediately after the original
      const rank = apiRecordsRankingManager.getRankForDuplicatedApi(context, record, record.collectionId ?? "");

      const newRecord: Omit<RQAPI.ApiRecord, "id"> = {
        ...rest,
        name: `(Copy) ${record.name || record.data.request?.url}`,
        rank, // Set the calculated rank
      };

      try {
        const result = await apiClientRecordsRepository.createRecord(newRecord);
        if (!result.success) throw new Error("Failed to duplicate request");

        onSaveRecord(result.data, "open");
        toast.success("Request duplicated successfully");
        trackRequestDuplicated();
      } catch (error: any) {
        console.error("Error duplicating request:", error);
        notification.error({
          message: "Error duplicating request",
          description: error?.message || "Unexpected error. Please contact support.",
          placement: "bottomRight",
        });
        trackDuplicateRequestFailed();
      }
    },
    [context, apiClientRecordsRepository, onSaveRecord]
  );

  const requestOptions = useMemo((): MenuProps["items"] => {
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
          handleDropdownVisibleChange(false);
        },
      },
      {
        key: "1",
        label: (
          <LocalWorkspaceTooltip featureName="Request duplication" placement="bottomRight">
            <div>
              <MdContentCopy style={{ marginRight: 8 }} />
              Duplicate
            </div>
          </LocalWorkspaceTooltip>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          handleDuplicateRequest(record);
          trackDuplicateRequestClicked();
          handleDropdownVisibleChange(false);
        },
      },
      {
        key: "2",
        label: (
          <div>
            <MdMoveDown style={{ marginRight: 8 }} />
            Move to Collection
          </div>
        ),
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setRecordToMove(record);
          trackMoveRequestToCollectionClicked();
          handleDropdownVisibleChange(false);
        },
      },
      {
        key: "3",
        label: (
          <div>
            <MdOutlineDelete style={{ marginRight: 8 }} />
            Delete
          </div>
        ),
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          handleRecordsToBeDeleted([record]);
          handleDropdownVisibleChange(false);
        },
      },
    ];
  }, [record, handleRecordsToBeDeleted, handleDuplicateRequest]);

  const examples = record.data.examples || [];

  const { activeKey, collapseChangeHandler } = useCollapsibleRow({
    recordId: record.id,
    expandedRecordIds,
    setExpandedRecordIds,
  });

  const requestRowHeader = (
    <div
      className="collapsible-request-row-header"
      onClick={(e) => {
        if (onItemClick && (e.metaKey || e.ctrlKey)) {
          e.stopPropagation();
          onItemClick(record, e);
          return;
        }

        const isExpanded = activeKey === record.id;
        const isAlreadyActive = activeTabSourceId === record.id;

        if (!isExpanded) {
          if (!isAlreadyActive) {
            openBufferedTab({
              source: new RequestViewTabSource({
                id: record.id,
                apiEntryDetails: record,
                title: record.name || record.data.request?.url,
                context: { id: workspaceId },
              }),
            });
          }
        } else {
          if (!isAlreadyActive) {
            e.stopPropagation();
            openBufferedTab({
              source: new RequestViewTabSource({
                id: record.id,
                apiEntryDetails: record,
                title: record.name || record.data.request?.url,
                context: { id: workspaceId },
              }),
            });
          }
        }
      }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <RequestIcon record={record} />

      <Typography.Text
        ellipsis={{
          tooltip: {
            title: record.name || record.data.request?.url,
            placement: "top",
            color: "#000",
            mouseEnterDelay: 0.5,
          },
        }}
        className="request-url"
      >
        {record.name || record.data.request?.url}
      </Typography.Text>

      <Conditional condition={!isReadOnly}>
        <div className={`request-options ${isDropdownVisible ? "active" : ""}`}>
          <Dropdown
            trigger={["click"]}
            menu={{ items: requestOptions }}
            placement="bottomRight"
            open={isDropdownVisible}
            onOpenChange={handleDropdownVisibleChange}
          >
            <RQButton
              onClick={(e) => {
                e.stopPropagation();
                setShowSelection(false);
              }}
              size="small"
              type="transparent"
              icon={<MdOutlineMoreHoriz />}
            />
          </Dropdown>
        </div>
      </Conditional>
    </div>
  );

  return (
    <>
      {recordToMove && (
        <MoveToCollectionModal
          recordsToMove={[recordToMove]}
          isOpen={!!recordToMove}
          onClose={() => {
            setRecordToMove(null);
          }}
        />
      )}

      {isEditMode ? (
        <NewRecordNameInput
          analyticEventSource="collection_row"
          recordType={RQAPI.RecordType.API}
          recordToBeEdited={record}
          onSuccess={() => {
            setIsEditMode(false);
          }}
        />
      ) : examples.length > 0 ? (
        <div
          className={clsx("request-row", {
            "request-drop-before": dropPosition === "before",
            "request-drop-after": dropPosition === "after",
          })}
          ref={(node) => {
            requestRowRef.current = node;
            drag(node);
            drop(node);
          }}
          style={{ opacity: isDragging || isDropProcessing ? 0.5 : 1 }}
        >
          <ApiClientSidebarCollapse
            id={record.id}
            isActive={!!activeKey}
            onCollapseToggle={collapseChangeHandler}
            collapsible="icon"
            className="request-with-examples-row"
            panelClassName={`${record.id === activeTabSourceId ? "active" : ""} ${
              selectedRecords.has(record.id) && showSelection ? "selected" : ""
            }`}
            expandIconPrefix={
              showSelection ? (
                <div className="collection-checkbox-container" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    onChange={recordsSelectionHandler.bind(this, record)}
                    checked={selectedRecords.has(record.id)}
                  />
                </div>
              ) : undefined
            }
            header={requestRowHeader}
          >
            {examples.map((example) => (
              <ExampleRow
                key={example.id}
                record={example}
                isReadOnly={isReadOnly}
                handleRecordsToBeDeleted={handleRecordsToBeDeleted}
              />
            ))}
          </ApiClientSidebarCollapse>
        </div>
      ) : (
        <div
          className={clsx("request-row", {
            "request-drop-before": dropPosition === "before",
            "request-drop-after": dropPosition === "after",
          })}
          ref={(node) => {
            requestRowRef.current = node;
            drag(node);
            drop(node);
          }}
          style={{ opacity: isDragging || isDropProcessing ? 0.5 : 1 }}
        >
          <div
            className={`collections-list-item api ${record.id === activeTabSourceId ? "active" : ""} ${
              selectedRecords.has(record.id) && showSelection ? "selected" : ""
            }`}
            onClick={(e) => {
              if (onItemClick && (e.metaKey || e.ctrlKey)) {
                onItemClick(record, e);
                return;
              }

              openBufferedTab({
                source: new RequestViewTabSource({
                  id: record.id,
                  apiEntryDetails: record,
                  title: record.name || record.data.request?.url,
                  context: {
                    id: workspaceId,
                  },
                }),
              });
            }}
          >
            {showSelection && (
              <Checkbox
                onChange={recordsSelectionHandler.bind(this, record)}
                checked={selectedRecords.has(record.id)}
              />
            )}
            <div style={{ width: 8 }} />
            <RequestIcon record={record} />
            <Typography.Text
              ellipsis={{
                tooltip: {
                  title: record.name || record.data.request?.url,
                  placement: "right",
                  color: "#000",
                  mouseEnterDelay: 0.5,
                },
              }}
              className="request-url"
            >
              {record.name || record.data.request?.url}
            </Typography.Text>

            <Conditional condition={!isReadOnly}>
              <div className={`request-options ${isDropdownVisible ? "active" : ""}`}>
                <Dropdown
                  trigger={["click"]}
                  menu={{ items: requestOptions }}
                  placement="bottomRight"
                  open={isDropdownVisible}
                  onOpenChange={handleDropdownVisibleChange}
                >
                  <RQButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSelection(false);
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
      )}
    </>
  );
};
