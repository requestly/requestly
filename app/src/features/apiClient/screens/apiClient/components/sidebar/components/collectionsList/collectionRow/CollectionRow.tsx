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
import { NewApiRecordDropdown, NewRecordDropdownItemType } from "../../NewApiRecordDropdown/NewApiRecordDropdown";
import "./CollectionRow.scss";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useCommand } from "features/apiClient/commands";
import { ApiClientExportModal } from "../../../../modals/exportModal/ApiClientExportModal";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (
    src: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise<void>;
  setExpandedRecordIds: (keys: RQAPI.ApiClientRecord["id"][]) => void;
  expandedRecordIds: string[];
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.ApiClientRecord["id"]>;
    recordsSelectionHandler: (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context?: ApiClientFeatureContext) => void;
}

export const CollectionRow: React.FC<Props> = ({
  record,
  onNewClick,
  expandedRecordIds,
  setExpandedRecordIds,
  bulkActionOptions,
  isReadOnly,
  handleRecordsToBeDeleted,
}) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState(expandedRecordIds?.includes(record.id) ? record.id : null);
  const [createNewField, setCreateNewField] = useState(null);
  const [hoveredId, setHoveredId] = useState("");
  const [isCollectionRowLoading, setIsCollectionRowLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [collectionsToExport, setCollectionsToExport] = useState([]);

  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const {
    api: { forceRefreshRecords: forceRefreshApiClientRecords },
  } = useCommand();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const contextId = useContextId();
  const [openTab, activeTabSource] = useTabServiceWithSelector((state) => [state.openTab, state.activeTabSource]);
  const [getParentChain, getRecordDataFromId] = useAPIRecords((state) => [state.getParentChain, state.getData]);

  const handleCollectionExport = useCallback((collection: RQAPI.CollectionRecord) => {
    setCollectionsToExport((prev) => [...prev, collection]);
    setIsExportModalOpen(true);
  }, []);

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
            <div>
              <MdOutlineIosShare style={{ marginRight: 8 }} />
              Export
            </div>
          ),
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            handleCollectionExport(record);
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
            handleRecordsToBeDeleted([record]);
          },
        },
      ];

      return items;
    },
    [handleRecordsToBeDeleted, handleCollectionExport]
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
    setActiveKey(expandedRecordIds?.includes(record.id) ? record.id : null);
  }, [expandedRecordIds, record.id]);

  useEffect(() => {
    /* Temporary Change-> To remove previous key from session storage
       which was added due to the previous logic can be removed after some time */
    sessionStorage.removeItem("collapsed_collection_keys");
  }, []);

  const handleRecordDrop = useCallback(
    async (item: Partial<RQAPI.ApiClientRecord>) => {
      try {
        const entryToMove = getRecordDataFromId(item.id);
        const result = await apiClientRecordsRepository.moveAPIEntities([entryToMove], record.id);
        onSaveRecord(result[0]);
        forceRefreshApiClientRecords();

        // Expand the collection after successful drop
        if (!expandedRecordIds.includes(record.id)) {
          const newExpandedRecordIds = [...expandedRecordIds, record.id];
          setExpandedRecordIds(newExpandedRecordIds);
          sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, newExpandedRecordIds);
        }
      } catch (error) {
        console.log("error DBG", error);
        notification.error({
          message: "Error moving item",
          description: error?.message || "Failed to move item. Please try again.",
          placement: "bottomRight",
        });
      } finally {
        setIsCollectionRowLoading(false);
      }
    },
    [
      record.id,
      apiClientRecordsRepository,
      onSaveRecord,
      forceRefreshApiClientRecords,
      expandedRecordIds,
      setExpandedRecordIds,
      getRecordDataFromId,
    ]
  );

  const checkCanDropItem = useCallback(
    (item: Partial<RQAPI.ApiClientRecord>): boolean => {
      if (item.id === record.id) {
        return false;
      }

      if (item.collectionId === record.id) {
        return false;
      }

      // For collections, check for circular reference (parent-child relationship)
      if (item.type === RQAPI.RecordType.COLLECTION) {
        const parentIds = getParentChain(record.id);
        const wouldCreateCircularReference = parentIds.includes(item.id);
        return !wouldCreateCircularReference;
      }

      return true;
    },
    [getParentChain, record.id]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: RQAPI.RecordType.COLLECTION,
      item: { id: record.id, type: record.type, collectionId: record.collectionId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [record.id, record.type]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.API, RQAPI.RecordType.COLLECTION],
      drop: (item: Partial<RQAPI.ApiClientRecord>, monitor) => {
        const isOverCurrent = monitor.isOver({ shallow: true });
        if (!isOverCurrent) return;

        if (item.id === record.id) return;
        setIsCollectionRowLoading(true);
        handleRecordDrop(item);
      },
      canDrop: checkCanDropItem,
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [handleRecordDrop, checkCanDropItem]
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
              className={`collection-panel ${record.id === activeTabSourceId ? "active" : ""}`}
              key={record.id}
              header={
                <div
                  ref={drag}
                  className="collection-name-container"
                  onMouseEnter={() => setHoveredId(record.id)}
                  onMouseLeave={() => setHoveredId("")}
                  onClick={(e) => {
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
                              id: contextId,
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
                              id: contextId,
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
                    <div
                      className={`collection-options ${hoveredId === record.id || isDropdownVisible ? "active" : " "}`}
                    >
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
                      onNewClick={onNewClick}
                    />
                  ) : (
                    record.data.children?.map((apiRecord) => {
                      if (apiRecord.type === RQAPI.RecordType.API) {
                        return (
                          <RequestRow
                            isReadOnly={isReadOnly}
                            key={apiRecord.id}
                            record={apiRecord}
                            bulkActionOptions={bulkActionOptions}
                            handleRecordsToBeDeleted={handleRecordsToBeDeleted}
                          />
                        );
                      } else if (apiRecord.type === RQAPI.RecordType.COLLECTION) {
                        return (
                          <CollectionRow
                            isReadOnly={isReadOnly}
                            key={apiRecord.id}
                            record={apiRecord}
                            onNewClick={onNewClick}
                            expandedRecordIds={expandedRecordIds}
                            setExpandedRecordIds={setExpandedRecordIds}
                            bulkActionOptions={bulkActionOptions}
                            handleRecordsToBeDeleted={handleRecordsToBeDeleted}
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
