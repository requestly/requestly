import React, { useCallback, useState } from "react";
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

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (src: RQAPI.AnalyticsEventSource) => void;
  onExportClick: (collection: RQAPI.CollectionRecord) => void;
  openTab: TabsLayoutContextInterface["openTab"];
}

export const CollectionRow: React.FC<Props> = ({ record, onNewClick, onExportClick, openTab }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState(record.id); // TODO: Persist collapse active keys for all rows
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
        // {
        //   key: "1",
        //   label: <div>Export</div>,
        //   onClick: (itemInfo) => {
        //     itemInfo.domEvent?.stopPropagation?.();
        //     onExportClick(record);
        //   },
        // },
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
          onChange={(keys) => {
            setActiveKey(keys[0]);
          }}
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
                onMouseEnter={setHoveredId.bind(this, record.id)}
                onMouseLeave={setHoveredId.bind(this, "")}
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
                recordType={RQAPI.RecordType.API}
                newRecordCollectionId={record.id}
                message="No requests created yet"
                newRecordBtnText="New request"
                onNewRecordClick={() => onNewClick("collection_row")}
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
                    />
                  );
                }

                return null;
              })
            )}

            {createNewField ? (
              <NewRecordNameInput
                analyticEventSource="collection_row"
                recordType={
                  createNewField === RQAPI.RecordType.API ? RQAPI.RecordType.API : RQAPI.RecordType.COLLECTION
                }
                newRecordCollectionId={record.id}
                onSuccess={() => {
                  setCreateNewField("");
                }}
              />
            ) : null}
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};
