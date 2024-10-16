import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { Collapse, Dropdown, MenuProps } from "antd";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useState } from "react";
import { EmptyState } from "../../emptyState/EmptyState";
import "./collectionRow.scss";
import { NewRecordNameInput } from "../newRecordNameInput/NewRecordNameInput";

interface Props {
  record: RQAPI.CollectionRecord;
  createNewRecord: (recordType: RQAPI.RecordType, collectionId: string) => void;
}

export const CollectionRow: React.FC<Props> = ({ record, createNewRecord }) => {
  const [isEditMode, setIsEditMode] = useState(false);

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
            className=""
            header={
              <div className="collection-name-container">
                <div className="collection-name">{record.name}</div>

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
                    className="collection-options"
                    icon={<MdOutlineMoreHoriz />}
                  />
                </Dropdown>
              </div>
            }
          >
            <EmptyState
              message="No requests created yet"
              newRecordBtnText="New request"
              onNewRecordClick={() => {
                createNewRecord(RQAPI.RecordType.API, record.id);
              }}
            />
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};
