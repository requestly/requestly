import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Checkbox, Collapse, Dropdown, MenuProps, Skeleton, Typography, notification } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { RequestRow } from "../requestRow/RequestRow";
import { ApiRecordEmptyState } from "../apiRecordEmptyState/ApiRecordEmptyState";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineFolderSpecial } from "@react-icons/all-files/md/MdOutlineFolderSpecial";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { IoChevronForward } from "@react-icons/all-files/io5/IoChevronForward";
import { SidebarPlaceholderItem } from "../../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isEmpty } from "lodash";
import { sessionStorage } from "utils/sessionStorage";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { Conditional } from "components/common/Conditional";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { CollectionViewTabSource } from "../../../../views/components/Collection/collectionViewTabSource";
import { useDrag, useDrop } from "react-dnd";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import RequestlyIcon from "assets/img/brand/rq_logo.svg";
import PostmanIcon from "assets/img/brand/postman-icon.svg";
import { NewApiRecordDropdown, NewRecordDropdownItemType } from "../../NewApiRecordDropdown/NewApiRecordDropdown";
import "./CollectionRow.scss";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { ApiClientExportModal } from "../../../../modals/exportModal/ApiClientExportModal";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { moveRecordsAcrossWorkspace } from "features/apiClient/commands/records";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { useApiClientContext } from "features/apiClient/contexts";
import { PostmanExportModal } from "../../../../modals/postmanCollectionExportModal/PostmanCollectionExportModal";
import { CollectionRecordState } from "features/apiClient/store/apiRecords/apiRecords.store";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { CollectionRowOptionsCustomEvent, dispatchCustomEvent } from "./utils";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

export enum ExportType {
  REQUESTLY = "requestly",
  POSTMAN = "postman",
}

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (
    src: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise<void>;
  onRequestlyExportClick: (collection: RQAPI.CollectionRecord, exportType: ExportType) => void;
  setExpandedRecordIds: (keys: RQAPI.ApiClientRecord["id"][]) => void;
  expandedRecordIds: string[];
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.ApiClientRecord["id"]>;
    recordsSelectionHandler: (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
  onItemClick?: (record: RQAPI.ApiClientRecord, event: React.MouseEvent) => void;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context?: ApiClientFeatureContext) => void;
}

export type DraggableApiRecord = {
  record: RQAPI.ApiClientRecord;
  contextId: ApiClientFeatureContext["id"];
};

export const CollectionRow: React.FC<Props> = ({
  record,
  onNewClick,
  onRequestlyExportClick: onExportClick,
  expandedRecordIds,
  setExpandedRecordIds,
  bulkActionOptions,
  isReadOnly,
  handleRecordsToBeDeleted,
  onItemClick,
}) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState<string | undefined>(
    expandedRecordIds?.includes(record.id) ? record.id : undefined
  );
  const [createNewField, setCreateNewField] = useState<RQAPI.RecordType | null>(null);
  const [hoveredId, setHoveredId] = useState("");
  const [isCollectionRowLoading, setIsCollectionRowLoading] = useState(false);
  const hoverExpandTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.CollectionRecord[]>([]);
  const { onNewClickV2 } = useApiClientContext();
  const context = useApiClientFeatureContext();
  const [openTab, activeTabSource] = useTabServiceWithSelector((state) => [state.openTab, state.activeTabSource]);

  const [getParentChain, getRecordStore] = useAPIRecords((state) => [state.getParentChain, state.getRecordStore]);
  const handleCollectionExport = useCallback(
    (collection: RQAPI.CollectionRecord, exportType: ExportType) => {
      const collectionRecordState = getRecordStore(record.id)?.getState() as CollectionRecordState;
      const collectionVariables = collectionRecordState.collectionVariables.getState().data;

      const removeLocalValue = (variables: Map<string, any>): Record<string, any> => {
        // set localValue to empty before exporting
        return Object.fromEntries([...variables.entries()].map(([k, v]) => [k, { ...v, localValue: "" }]));
      };

      const exportData: RQAPI.CollectionRecord = {
        ...collection,
        data: { ...collection.data, variables: removeLocalValue(collectionVariables) },
      };
      setCollectionsToExport((prev) => [...prev, exportData]);

      switch (exportType) {
        case ExportType.REQUESTLY:
          setIsExportModalOpen(true);
          break;
        case ExportType.POSTMAN:
          setIsPostmanExportModalOpen(true);
          break;
        default:
          console.warn(`Unknown export type: ${exportType}`);
      }
    },
    [getRecordStore, record.id]
  );

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  const getCollectionOptions = useCallback(
    (record: RQAPI.CollectionRecord) => {
      const items: MenuProps["items"] = [
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
          },
        },
        {
          key: "1",
          label: (
            <span>
              <MdOutlineIosShare style={{ marginRight: 8 }} />
              Export as
            </span>
          ),
          expandIcon: <IoChevronForward style={{ position: "absolute", right: 12 }} />,
          children: [
            {
              key: "1-1",
              label: "Requestly",
              icon: <img src={RequestlyIcon} alt="Requestly Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
              onClick: (itemInfo) => {
                itemInfo.domEvent?.stopPropagation?.();
                handleCollectionExport(record, ExportType.REQUESTLY);
              },
            },
            {
              key: "1-2",
              label: "Postman (v2.1 format)",
              icon: <img src={PostmanIcon} alt="Postman Icon" style={{ width: 16, height: 16, marginRight: 8 }} />,
              onClick: (itemInfo) => {
                itemInfo.domEvent?.stopPropagation?.();
                handleCollectionExport(record, ExportType.POSTMAN);
              },
            },
          ],
        },
        {
          key: "2",
          label: (
            <div className="collection-row-option">
              <MdOutlineVideoLibrary />
              Run
            </div>
          ),
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            openTab(
              new CollectionViewTabSource({
                id: record.id,
                title: record.name || "New Collection",
                context: { id: context.id },
              })
            );

            setTimeout(() => dispatchCustomEvent(CollectionRowOptionsCustomEvent.OPEN_RUNNER_TAB), 0);
          },
        },
        {
          key: "3",
          label: (
            <div className="collection-row-option">
              <MdOutlineDelete />
              Delete
            </div>
          ),
          danger: true,
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            handleRecordsToBeDeleted([record]);
          },
        },
      ];

      return items;
    },
    [handleCollectionExport, openTab, context.id, handleRecordsToBeDeleted]
  );

  const collapseChangeHandler = useCallback(
    (keys: RQAPI.ApiClientRecord["id"][]) => {
      let activeKeysCopy = [...expandedRecordIds];
      if (isEmpty(keys)) {
        activeKeysCopy = activeKeysCopy.filter((key) => key !== record.id);
      } else if (!activeKeysCopy.includes(record.id)) {
        activeKeysCopy.push(record.id);
      }
      setExpandedRecordIds(activeKeysCopy);
      isEmpty(activeKeysCopy)
        ? sessionStorage.removeItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY)
        : sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, activeKeysCopy);
    },
    [record, expandedRecordIds, setExpandedRecordIds]
  );

  useEffect(() => {
    setActiveKey(expandedRecordIds?.includes(record.id) ? record.id : undefined);
  }, [expandedRecordIds, record.id]);

  useEffect(() => {
    /* Temporary Change-> To remove previous key from session storage
       which was added due to the previous logic can be removed after some time */
    sessionStorage.removeItem("collapsed_collection_keys");
  }, []);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverExpandTimeoutRef.current) {
        clearTimeout(hoverExpandTimeoutRef.current);
      }
    };
  }, []);

  const handleRecordDrop = useCallback(
    async (item: DraggableApiRecord, dropContextId: string) => {
      try {
        const sourceContext = getApiClientFeatureContext(item.contextId);
        if (!sourceContext) {
          throw new Error(`Source context not found for id: ${item.contextId}`);
        }

        // Calculate rank to place dropped record at the bottom
        const existingChildren = record.data.children || [];
        const newRank = apiRecordsRankingManager.getNextRanks(existingChildren, [item.record])[0];

        const destination = {
          contextId: dropContextId,
          collectionId: record.id,
        };

        // Add rank to the record being moved
        const recordWithRank = { ...item.record, rank: newRank };

        await moveRecordsAcrossWorkspace(sourceContext, {
          recordsToMove: [recordWithRank],
          destination,
        });

        if (!expandedRecordIds.includes(record.id)) {
          const newExpandedRecordIds = [...expandedRecordIds, destination.collectionId];
          setExpandedRecordIds(newExpandedRecordIds);
          sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, newExpandedRecordIds);
        }
      } catch (error) {
        notification.error({
          message: "Error moving item",
          description: error?.message || "Failed to move item. Please try again.",
          placement: "bottomRight",
        });
      } finally {
        setIsCollectionRowLoading(false);
      }
    },
    [record.id, expandedRecordIds, setExpandedRecordIds]
  );

  const checkCanDropItem = useCallback(
    (item: DraggableApiRecord): boolean => {
      if (item.record.id === record.id) {
        return false;
      }

      if (item.record.collectionId === record.id) {
        return false;
      }

      // For collections, check for circular reference (parent-child relationship)
      if (item.record.type === RQAPI.RecordType.COLLECTION) {
        const parentIds = getParentChain(record.id);
        const wouldCreateCircularReference = parentIds.includes(item.record.id);
        return !wouldCreateCircularReference;
      }

      return true;
    },
    [getParentChain, record.id]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RQAPI.RecordType.COLLECTION,
      item: {
        record,
        contextId: context.id,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [record, context.id]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.API, RQAPI.RecordType.COLLECTION],
      hover: (item: DraggableApiRecord, monitor) => {
        const isOverCurrent = monitor.isOver({ shallow: true });
        if (!isOverCurrent) {
          // Clear timeout if no longer hovering
          if (hoverExpandTimeoutRef.current) {
            clearTimeout(hoverExpandTimeoutRef.current);
            hoverExpandTimeoutRef.current = null;
          }
          return;
        }

        // Check if collection is collapsed
        const IsTargetCollectionCollapsed = !expandedRecordIds.includes(record.id);

        // If collapsed and not already expanding, set timeout to expand
        if (IsTargetCollectionCollapsed && !hoverExpandTimeoutRef.current) {
          hoverExpandTimeoutRef.current = setTimeout(() => {
            const newExpandedRecordIds = [...expandedRecordIds, record.id];
            setExpandedRecordIds(newExpandedRecordIds);
            sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, newExpandedRecordIds);
            hoverExpandTimeoutRef.current = null;
          }, 600); // 600ms delay before auto-expanding
        }
      },
      drop: (item: DraggableApiRecord, monitor) => {
        // Clear hover timeout on drop
        if (hoverExpandTimeoutRef.current) {
          clearTimeout(hoverExpandTimeoutRef.current);
          hoverExpandTimeoutRef.current = null;
        }

        const isOverCurrent = monitor.isOver({ shallow: true });
        if (!isOverCurrent) return;

        if (item.record.id === record.id) return;
        setIsCollectionRowLoading(true);
        handleRecordDrop(item, context.id);
      },
      canDrop: checkCanDropItem,
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [handleRecordDrop, checkCanDropItem, context.id, expandedRecordIds, record.id, setExpandedRecordIds]
  );

  return (
    <>
      {isExportModalOpen ? (
        <ApiClientExportModal
          exportType="collection"
          recordsToBeExported={collectionsToExport}
          isOpen={isExportModalOpen}
          onClose={() => {
            setCollectionsToExport([]);
            setIsExportModalOpen(false);
          }}
        />
      ) : null}

      {isPostmanExportModalOpen && (
        <PostmanExportModal
          recordsToBeExported={collectionsToExport}
          isOpen={isPostmanExportModalOpen}
          onClose={() => {
            setCollectionsToExport([]);
            setIsPostmanExportModalOpen(false);
          }}
        />
      )}

      {isEditMode ? (
        <NewRecordNameInput
          analyticEventSource="collection_row"
          recordType={RQAPI.RecordType.COLLECTION}
          recordToBeEdited={record}
          onSuccess={() => {
            setIsEditMode(false);
          }}
        />
      ) : (
        <div ref={drop} className={isOver ? "collection-drop-target" : ""}>
          <Collapse
            activeKey={activeKey}
            onChange={collapseChangeHandler}
            collapsible="header"
            defaultActiveKey={[record.id]}
            ghost
            className="collections-list-item collection"
            expandIcon={({ isActive }) => {
              return (
                <>
                  {showSelection && (
                    <div className="collection-checkbox-container" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        onChange={recordsSelectionHandler.bind(this, record)}
                        checked={selectedRecords.has(record.id)}
                      />
                    </div>
                  )}
                  {
                    // @ts-ignore
                    record.isExampleRoot ? (
                      <MdOutlineFolderSpecial className="collection-expand-icon" />
                    ) : isActive ? (
                      <PiFolderOpen className="collection-expand-icon" />
                    ) : (
                      <MdOutlineFolder className="collection-expand-icon" />
                    )
                  }
                </>
              );
            }}
          >
            <Collapse.Panel
              className={`collection-panel ${record.id === activeTabSourceId ? "active" : ""} ${
                selectedRecords.has(record.id) && showSelection ? "selected" : ""
              }`}
              key={record.id}
              header={
                <div
                  ref={drag}
                  className="collection-name-container"
                  onMouseEnter={() => setHoveredId(record.id)}
                  onMouseLeave={() => setHoveredId("")}
                  onClick={(e) => {
                    if (onItemClick && (e.metaKey || e.ctrlKey)) {
                      e.stopPropagation();
                      onItemClick(record, e);
                      return;
                    }
                    const isExpanded = activeKey === record.id;
                    const isAlreadyActive = activeTabSourceId === record.id;
                    if (!isExpanded) {
                      // Collection is collapsed - open tab and expand
                      if (!isAlreadyActive) {
                        openTab(
                          new CollectionViewTabSource({
                            id: record.id,
                            title: record.name || "New Collection",
                            context: {
                              id: context.id,
                            },
                          }),
                          { preview: true }
                        );
                      }
                      // Don't stop propagation - allow expand
                    } else {
                      // Collection is expanded
                      if (!isAlreadyActive) {
                        // First click - make tab active and prevent collapse
                        e.stopPropagation();
                        openTab(
                          new CollectionViewTabSource({
                            id: record.id,
                            title: record.name || "New Collection",
                            context: {
                              id: context.id,
                            },
                          }),
                          { preview: true }
                        );
                      }
                      // Second click (when already active) - allow collapse by not stopping propagation
                    }
                  }}
                  style={{
                    opacity: isDragging ? 0.5 : 1,
                  }}
                >
                  <Typography.Text
                    ellipsis={{
                      tooltip: {
                        title: record.name,
                        placement: "right",
                        color: "#000",
                        mouseEnterDelay: 0.5,
                      },
                    }}
                    className="collection-name"
                  >
                    {record.name}
                  </Typography.Text>

                  <Conditional condition={!isReadOnly}>
                    <div className={`collection-options ${hoveredId === record.id ? "active" : " "}`}>
                      <NewApiRecordDropdown
                        invalidActions={[NewRecordDropdownItemType.ENVIRONMENT]}
                        onSelect={(params) => {
                          setActiveKey(record.id);
                          setCreateNewField(params.recordType);
                          onNewClick("collection_row", params.recordType, record.id, params.entryType).then(() => {
                            setCreateNewField(null);
                          });
                        }}
                      >
                        <RQButton
                          size="small"
                          type="transparent"
                          icon={<MdAdd />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </NewApiRecordDropdown>
                      <Dropdown
                        trigger={["click"]}
                        menu={{ items: getCollectionOptions(record) }}
                        placement="bottomRight"
                        overlayClassName="collection-dropdown-menu"
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
              }
            >
              {isCollectionRowLoading ? (
                <div className="loading-collection-row">
                  <Skeleton paragraph={{ rows: 4 }} title={false} />
                </div>
              ) : (
                <>
                  {record.data.children?.length === 0 ? (
                    <ApiRecordEmptyState
                      record={record}
                      disabled={isReadOnly}
                      message="No requests created yet"
                      newRecordBtnText="New collection"
                      onNewClick={(src, recordType, collectionId, entryType) =>
                        onNewClickV2({
                          contextId: context.id,
                          analyticEventSource: src,
                          recordType,
                          collectionId,
                          entryType,
                        })
                      }
                    />
                  ) : (
                    record.data.children?.map((apiRecord, index) => {
                      if (apiRecord.type === RQAPI.RecordType.API) {
                        return (
                          <RequestRow
                            isReadOnly={isReadOnly}
                            key={apiRecord.id}
                            record={apiRecord}
                            bulkActionOptions={bulkActionOptions}
                            handleRecordsToBeDeleted={handleRecordsToBeDeleted}
                            onItemClick={onItemClick}
                          />
                        );
                      } else if (apiRecord.type === RQAPI.RecordType.COLLECTION) {
                        return (
                          <CollectionRow
                            isReadOnly={isReadOnly}
                            key={apiRecord.id}
                            record={apiRecord}
                            onNewClick={onNewClick}
                            onRequestlyExportClick={onExportClick} // FIXME: this will break in multi-view
                            expandedRecordIds={expandedRecordIds}
                            setExpandedRecordIds={setExpandedRecordIds}
                            bulkActionOptions={bulkActionOptions}
                            handleRecordsToBeDeleted={handleRecordsToBeDeleted}
                            onItemClick={onItemClick}
                          />
                        );
                      }

                      return null;
                    })
                  )}

                  {createNewField ? (
                    <SidebarPlaceholderItem
                      name={createNewField === RQAPI.RecordType.API ? "New Request" : "New Collection"}
                    />
                  ) : null}
                </>
              )}
            </Collapse.Panel>
          </Collapse>
        </div>
      )}
    </>
  );
};
