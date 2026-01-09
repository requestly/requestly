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
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { RequestViewTabSource } from "../../../../views/components/RequestView/requestViewTabSource";
import { useDrag, useDrop } from "react-dnd";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientRepository, useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { getImmediateChildrenRecords } from "features/apiClient/hooks/useChildren.hook";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { isGraphQLApiRecord, isHttpApiRecord } from "features/apiClient/screens/apiClient/utils";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";
import { saveOrUpdateRecord } from "features/apiClient/commands/store.utils";
import { RecordData } from "features/apiClient/helpers/RankingManager/APIRecordsListRankingManager";
import clsx from "clsx";

interface Props {
  record: RQAPI.ApiRecord;
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.ApiClientRecord["id"]>;
    recordsSelectionHandler: (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
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
  handleRecordsToBeDeleted,
  onItemClick,
}) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [recordToMove, setRecordToMove] = useState<RQAPI.ApiRecord | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const requestRowRef = useRef<HTMLDivElement>(null);
  const ctx = useApiClientFeatureContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const { onSaveRecord } = useNewApiClientContext();
  const context = useApiClientFeatureContext();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const contextId = useContextId();
  const [activeTabSource, openTab] = useTabServiceWithSelector((state) => [state.activeTabSource, state.openTab]);

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RQAPI.RecordType.API,
      item: {
        record,
        contextId,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [record, contextId]
  );

  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.API],
      canDrop: (item: { record: RQAPI.ApiClientRecord; contextId: string }) => {
        if (!item || item.contextId !== contextId) return false;
        if (item.record.id === record.id) return false;
        return true;
      },
      hover: (item: { record: RQAPI.ApiClientRecord; contextId: string }, monitor) => {
        if (!monitor.isOver({ shallow: true })) {
          return;
        }

        const hoverBoundingRect = monitor.getClientOffset();
        const targetElement = requestRowRef.current;

        if (hoverBoundingRect && targetElement) {
          const targetRect = targetElement.getBoundingClientRect();
          const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
          const hoverClientY = hoverBoundingRect.y - targetRect.top;

          setDropPosition(hoverClientY < hoverMiddleY ? "before" : "after");
        }
      },
      drop: async (item: { record: RQAPI.ApiClientRecord; contextId: string }, monitor) => {
        if (!monitor.isOver({ shallow: true })) {
          setDropPosition(null);
          return;
        }

        const currentDropPosition = dropPosition;
        setDropPosition(null);

        try {
          const siblings = apiRecordsRankingManager.sort(getImmediateChildrenRecords(ctx, record.collectionId ?? ""));
          let before: RecordData | null = null;
          let after: RecordData | null = null;
          const recordIndex = siblings.findIndex((sibling) => sibling.id === record.id);

          if (currentDropPosition === "before") {
            before = record;
            after = siblings[recordIndex - 1] || null;
          } else if (currentDropPosition === "after") {
            after = record;
            before = siblings[recordIndex + 1] || null;
          }

          const rank = apiRecordsRankingManager.getRanksBetweenRecords(before, after, [item.record])[0];
          const targetCollectionId = record.collectionId;

          const patch: Partial<RQAPI.ApiRecord> = {
            id: item.record.id,
            rank,
            collectionId: targetCollectionId,
          };

          const result = await apiClientRecordsRepository.updateRecord(patch, item.record.id);

          if (result.success) {
            saveOrUpdateRecord(context, result.data);
          }
        } catch (error) {
          toast.error("Error moving record");
        }
      },
      collect: (monitor) => ({
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [record, contextId, dropPosition, apiClientRecordsRepository, context]
  );

  // Clear drop position when no longer hovering
  React.useEffect(() => {
    if (!isOverCurrent && dropPosition !== null) {
      setDropPosition(null);
    }
  }, [isOverCurrent, dropPosition]);

  const handleDropdownVisibleChange = (isOpen: boolean) => {
    setIsDropdownVisible(isOpen);
  };

  const handleDuplicateRequest = useCallback(
    async (record: RQAPI.ApiRecord) => {
      const { id, ...rest } = record;
      const newRecord: Omit<RQAPI.ApiRecord, "id"> = {
        ...rest,
        name: `(Copy) ${record.name || record.data.request?.url}`,
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
    [onSaveRecord, apiClientRecordsRepository]
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
      ) : (
        <div
          className={clsx("request-row", {
            "record-drop-before": dropPosition === "before",
            "record-drop-after": dropPosition === "after",
          })}
          ref={(node) => {
            requestRowRef.current = node;
            drag(node);
            drop(node);
          }}
          style={{ opacity: isDragging ? 0.5 : 1 }}
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

              openTab(
                new RequestViewTabSource({
                  id: record.id,
                  apiEntryDetails: record,
                  title: record.name || record.data.request?.url,
                  context: {
                    id: contextId,
                  },
                }),
                { preview: true }
              );
            }}
          >
            {showSelection && (
              <Checkbox
                onChange={recordsSelectionHandler.bind(this, record)}
                checked={selectedRecords.has(record.id)}
              />
            )}
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
