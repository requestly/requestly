import React, { useCallback, useState } from "react";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Collapse, Dropdown, MenuProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { RequestRow } from "../requestRow/RequestRow";
import { ApiRecordEmptyState } from "../apiRecordEmptyState/ApiRecordEmptyState";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { useApiClientContext } from "features/apiClient/contexts";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import { trackNewRequestClicked } from "modules/analytics/events/features/apiClient";

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: (src: RQAPI.AnalyticsEventSource) => void;
  onExportClick: (collection: RQAPI.CollectionRecord) => void;
}

export const CollectionRow: React.FC<Props> = ({ record, onNewClick, onExportClick }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState(record.id); // TODO: Persist collapse active keys for all rows
  const [isCreateNewRequest, setIsCreateNewRequest] = useState(false);
  const { updateRecordToBeDeleted, setIsDeleteModalOpen } = useApiClientContext();

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
    [setIsDeleteModalOpen, updateRecordToBeDeleted, onExportClick]
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
          defaultActiveKey={[record.id]}
          ghost
          className="collections-list-item collection"
          expandIcon={({ isActive }) => {
            return isActive ? <PiFolderOpen /> : <MdOutlineFolder />;
          }}
        >
          <Collapse.Panel
            key={record.id}
            header={
              <div className="collection-name-container">
                <div className="collection-name" title={record.name}>
                  {record.name}
                </div>

                <div className="collection-options">
                  <RQButton
                    size="small"
                    type="transparent"
                    icon={<MdAdd />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveKey(record.id);
                      setIsCreateNewRequest(true);
                      trackNewRequestClicked("collection_row");
                    }}
                  />

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
                  // For now there will only be requests inside collection
                  return <RequestRow key={apiRecord.id} record={apiRecord} />;
                }

                return null; // Just to avoid warning, this case wont happen!
              })
            )}

            {isCreateNewRequest ? (
              <NewRecordNameInput
                analyticEventSource="collection_row"
                recordType={RQAPI.RecordType.API}
                newRecordCollectionId={record.id}
                onSuccess={() => {
                  setIsCreateNewRequest(false);
                }}
              />
            ) : null}
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};
