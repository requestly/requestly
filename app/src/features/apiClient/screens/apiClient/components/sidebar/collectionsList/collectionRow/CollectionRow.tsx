import React, { useCallback, useState } from "react";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Collapse, Dropdown, MenuProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";
import { RequestRow } from "../requestRow/RequestRow";
import { ApiRecordEmptyState } from "../apiRecordEmptyState/ApiRecordEmptyState";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";

interface Props {
  record: RQAPI.CollectionRecord;
  onNewClick: () => void;
}

export const CollectionRow: React.FC<Props> = ({ record, onNewClick }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateNewRequest, setIsCreateNewRequest] = useState(false);

  const getCollectionOptions = useCallback((record: RQAPI.CollectionRecord) => {
    const items: MenuProps["items"] = [
      // {
      //   key: "0",
      //   label: <div>Add request</div>,
      //   onClick: () => {},
      // },
      {
        key: "1",
        label: <div>Rename</div>,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          setIsEditMode(true);
        },
      },
      {
        key: "2",
        label: <div>Delete</div>,
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          // openNewCollectionModal();
          // setCollectionToBeUpdate(record);
        },
      },
    ];

    return items;
  }, []);

  return (
    <>
      {isEditMode ? (
        <NewRecordNameInput
          recordType={RQAPI.RecordType.COLLECTION}
          recordToBeEdited={record}
          onSuccess={() => {
            setIsEditMode(false);
          }}
        />
      ) : (
        <Collapse defaultActiveKey={[record.id]} ghost className="collections-list-item collection">
          <Collapse.Panel
            key={record.id}
            header={
              <div className="collection-name-container">
                <div className="collection-name">{record.name}</div>

                <div className="collection-options">
                  <RQButton
                    size="small"
                    type="transparent"
                    icon={<MdAdd />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateNewRequest(true);
                    }}
                  />

                  <Dropdown
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsEditMode(false);
                      }
                    }}
                    trigger={["click"]}
                    menu={{ items: getCollectionOptions(record) }}
                    placement="bottomRight"
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
              </div>
            }
          >
            {record.data.children?.length === 0 ? (
              <ApiRecordEmptyState
                recordType={RQAPI.RecordType.API}
                newRecordCollectionId={record.id}
                message="No requests created yet"
                newRecordBtnText="New request"
                onNewRecordClick={onNewClick}
              />
            ) : (
              record.data.children.map((apiRecord) => {
                if (apiRecord.type === RQAPI.RecordType.API) {
                  // For now there will only be requests inside collections
                  return <RequestRow record={apiRecord} />;
                }
              })
            )}

            {isCreateNewRequest ? (
              <NewRecordNameInput
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
