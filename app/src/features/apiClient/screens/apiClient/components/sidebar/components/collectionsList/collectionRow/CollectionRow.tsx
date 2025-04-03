import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Checkbox, Collapse, Dropdown, MenuProps, Tooltip } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { RequestRow } from "../requestRow/RequestRow";
import { ApiRecordEmptyState } from "../apiRecordEmptyState/ApiRecordEmptyState";
import { useApiClientContext } from "features/apiClient/contexts";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { FileAddOutlined, FolderAddOutlined } from "@ant-design/icons";
import { SidebarPlaceholderItem } from "../../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isEmpty } from "lodash";
import { sessionStorage } from "utils/sessionStorage";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { MdOutlineBorderColor } from "@react-icons/all-files/md/MdOutlineBorderColor";
import { MdOutlineDelete } from "@react-icons/all-files/md/MdOutlineDelete";
import { MdOutlineIosShare } from "@react-icons/all-files/md/MdOutlineIosShare";
import { Conditional } from "components/common/Conditional";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { CollectionViewTabSource } from "../../../../clientView/components/Collection/collectionViewTabSource";
import "./CollectionRow.scss";

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType, collectionId?: string) => Promise<void>;
  onExportClick: (collection: RQAPI.CollectionRecord) => void;
  setExpandedRecordIds: (keys: RQAPI.Record["id"][]) => void;
  expandedRecordIds: string[];
  isReadOnly: boolean;
  bulkActionOptions: {
    showSelection: boolean;
    selectedRecords: Set<RQAPI.Record["id"]>;
    recordsSelectionHandler: (record: RQAPI.Record, event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowSelection: (arg: boolean) => void;
  };
}

export const CollectionRow: React.FC<Props> = ({
  record,
  onNewClick,
  onExportClick,
  expandedRecordIds,
  setExpandedRecordIds,
  bulkActionOptions,
  isReadOnly,
}) => {
  const { selectedRecords, showSelection, recordsSelectionHandler, setShowSelection } = bulkActionOptions || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState(expandedRecordIds?.includes(record.id) ? record.id : null);
  const [createNewField, setCreateNewField] = useState(null);
  const [hoveredId, setHoveredId] = useState("");
  const { updateRecordsToBeDeleted, setIsDeleteModalOpen } = useApiClientContext();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [openTab, activeTabSource] = useTabServiceWithSelector((state) => [state.openTab, state.activeTabSource]);

  const activeTabSourceId = useMemo(() => {
    if (activeTabSource) {
      return activeTabSource.getSourceId();
    }
  }, [activeTabSource]);

  const handleDropdownVisibleChange = (isOpen: boolean) => {
    setIsDropdownVisible(isOpen);
  };

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
            onExportClick(record);
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
            updateRecordsToBeDeleted([record]);
            setIsDeleteModalOpen(true);
          },
        },
      ];

      return items;
    },
    [setIsDeleteModalOpen, updateRecordsToBeDeleted, onExportClick]
  );

  const collapseChangeHandler = useCallback(
    (keys: RQAPI.Record["id"][]) => {
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

  return (
    <>
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
        <Collapse
          activeKey={activeKey}
          onChange={collapseChangeHandler}
          collapsible={activeKey === record.id ? "icon" : "header"}
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
                {isActive ? (
                  <PiFolderOpen className="collection-expand-icon" />
                ) : (
                  <MdOutlineFolder className="collection-expand-icon" />
                )}
              </>
            );
          }}
        >
          <Collapse.Panel
            className={`collection-panel ${record.id === activeTabSourceId ? "active" : ""}`}
            key={record.id}
            header={
              <div
                className="collection-name-container"
                onMouseEnter={() => setHoveredId(record.id)}
                onMouseLeave={() => setHoveredId("")}
                onClick={() => {
                  openTab(new CollectionViewTabSource({ id: record.id, title: record.name || "New Collection" }), {
                    preview: true,
                  });
                }}
              >
                <div className="collection-name" title={record.name}>
                  {record.name}
                </div>

                <Conditional condition={!isReadOnly}>
                  <div
                    className={`collection-options ${hoveredId === record.id || isDropdownVisible ? "active" : " "}`}
                  >
                    <Tooltip title={"Add Request"}>
                      <RQButton
                        size="small"
                        type="transparent"
                        icon={<FileAddOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveKey(record.id);
                          setCreateNewField(RQAPI.RecordType.API);
                          onNewClick("collection_row", RQAPI.RecordType.API, record.id).then(() => {
                            setCreateNewField(null);
                          });
                        }}
                      />
                    </Tooltip>
                    <Tooltip title={"Add Folder"}>
                      <RQButton
                        size="small"
                        type="transparent"
                        icon={<FolderAddOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveKey(record.id);
                          setCreateNewField(RQAPI.RecordType.COLLECTION);
                          onNewClick("collection_row", RQAPI.RecordType.COLLECTION, record.id).then(() => {
                            setCreateNewField(null);
                          });
                        }}
                      />
                    </Tooltip>

                    <Dropdown
                      trigger={["click"]}
                      menu={{ items: getCollectionOptions(record) }}
                      placement="bottomRight"
                      overlayClassName="collection-dropdown-menu"
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
            }
          >
            {record.data.children?.length === 0 ? (
              <ApiRecordEmptyState
                disabled={isReadOnly}
                analyticEventSource="collection_row"
                message="No requests created yet"
                newRecordBtnText="New request"
                onNewRecordClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.API, record.id)}
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
                    />
                  );
                } else if (apiRecord.type === RQAPI.RecordType.COLLECTION) {
                  return (
                    <CollectionRow
                      isReadOnly={isReadOnly}
                      key={apiRecord.id}
                      record={apiRecord}
                      onNewClick={onNewClick}
                      onExportClick={onExportClick}
                      expandedRecordIds={expandedRecordIds}
                      setExpandedRecordIds={setExpandedRecordIds}
                      bulkActionOptions={bulkActionOptions}
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
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};
