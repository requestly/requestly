import React, { useCallback, useEffect, useState } from "react";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Collapse, Dropdown, MenuProps, Tooltip } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { RequestRow } from "../requestRow/RequestRow";
import { ApiRecordEmptyState } from "../apiRecordEmptyState/ApiRecordEmptyState";
import { useApiClientContext } from "features/apiClient/contexts";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";
import { FileAddOutlined, FolderAddOutlined } from "@ant-design/icons";
import { TabsLayoutContextInterface } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { useParams } from "react-router-dom";
import { SidebarPlaceholderItem } from "../../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isEmpty } from "lodash";
import { sessionStorage } from "utils/sessionStorage";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType, collectionId?: string) => Promise<void>;
  onExportClick: (collection: RQAPI.CollectionRecord) => void;
  openTab: TabsLayoutContextInterface["openTab"];
  setExpandedRecordIds: (keys: RQAPI.Record["id"][]) => void;
  expandedRecordIds: string[];
}

export const CollectionRow: React.FC<Props> = ({
  record,
  onNewClick,
  onExportClick,
  openTab,
  expandedRecordIds,
  setExpandedRecordIds,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState(expandedRecordIds?.includes(record.id) ? record.id : null);
  const [createNewField, setCreateNewField] = useState(null);
  const [hoveredId, setHoveredId] = useState("");
  const { updateRecordToBeDeleted, setIsDeleteModalOpen } = useApiClientContext();
  const { collectionId } = useParams();

  const getCollectionOptions = useCallback(
    (record: RQAPI.CollectionRecord) => {
      const items: MenuProps["items"] = [
        {
          key: "0",
          label: <div>Rename</div>,
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            setIsEditMode(true);
          },
        },
        {
          key: "1",
          label: <div>Export</div>,
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            onExportClick(record);
          },
        },
        {
          key: "2",
          label: <div>Delete</div>,
          danger: true,
          onClick: (itemInfo) => {
            itemInfo.domEvent?.stopPropagation?.();
            updateRecordToBeDeleted(record);
            setIsDeleteModalOpen(true);
          },
        },
      ];

      return items;
    },
    [setIsDeleteModalOpen, updateRecordToBeDeleted]
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
    [record, expandedRecordIds]
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
            return isActive ? (
              <PiFolderOpen className="collection-expand-icon" />
            ) : (
              <MdOutlineFolder className="collection-expand-icon" />
            );
          }}
        >
          <Collapse.Panel
            className={`collection-panel ${record.id === collectionId ? "active" : ""}`}
            key={record.id}
            header={
              <div
                className="collection-name-container"
                onMouseEnter={() => setHoveredId(record.id)}
                onMouseLeave={() => setHoveredId("")}
                onClick={() => {
                  openTab(record.id, {
                    title: record.name || "New Collection",
                    url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${record.id}`,
                  });
                }}
              >
                <div className="collection-name" title={record.name}>
                  {record.name}
                </div>

                <div className={`collection-options ${hoveredId === record.id ? "visible" : " "}`}>
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
                        trackNewRequestClicked("collection_row");
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
                        trackNewCollectionClicked("collection_row");
                      }}
                    />
                  </Tooltip>

                  <Dropdown trigger={["click"]} menu={{ items: getCollectionOptions(record) }} placement="bottomRight">
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
              </div>
            }
          >
            {record.data.children?.length === 0 ? (
              <ApiRecordEmptyState
                analyticEventSource="collection_row"
                message="No requests created yet"
                newRecordBtnText="New request"
                onNewRecordClick={() => onNewClick("collection_row", RQAPI.RecordType.API, record.id)}
              />
            ) : (
              record.data.children.map((apiRecord) => {
                if (apiRecord.type === RQAPI.RecordType.API) {
                  return <RequestRow key={apiRecord.id} record={apiRecord} openTab={openTab} />;
                } else if (apiRecord.type === RQAPI.RecordType.COLLECTION) {
                  return (
                    <CollectionRow
                      key={apiRecord.id}
                      openTab={openTab}
                      record={apiRecord}
                      onNewClick={onNewClick}
                      onExportClick={onExportClick}
                      expandedRecordIds={expandedRecordIds}
                      setExpandedRecordIds={setExpandedRecordIds}
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
