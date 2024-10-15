import React, { useCallback, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Collapse, Dropdown, MenuProps, Typography } from "antd";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { useApiClientContext } from "features/apiClient/contexts";
import { REQUEST_METHOD_COLORS } from "../../../../../../../constants";
import { EmptyCollectionList } from "./components";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import "./collectionsList.scss";

interface Props {
  onNewClick: () => void;
  onImportClick: () => void;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, onImportClick }) => {
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();
  const [collectionToBeUpdate, setCollectionToBeUpdate] = useState<RQAPI.CollectionRecord>();

  const getCollectionOptions = useCallback((record: RQAPI.CollectionRecord) => {
    const items: MenuProps["items"] = [
      {
        key: "0",
        label: <div>Add request</div>,
        onClick: () => {},
      },
      {
        key: "1",
        label: <div>Rename collection</div>,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          // openNewCollectionModal();
          setCollectionToBeUpdate(record);
        },
      },
      {
        key: "2",
        label: <div>Delete collection</div>,
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          // openNewCollectionModal();
          setCollectionToBeUpdate(record);
        },
      },
    ];

    return items;
  }, []);

  return (
    <>
      <div className="collections-list-container">
        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : apiClientRecords.length > 0 ? (
            <div className="collections-list">
              {apiClientRecords.map((record) => {
                if (record.type === RQAPI.RecordType.COLLECTION) {
                  return (
                    <Collapse defaultActiveKey={["1"]} ghost className="collections-list-item collection">
                      <Collapse.Panel
                        header={
                          <div className="collection-name-container">
                            <div className="collection-name">{record.name}</div>

                            <Dropdown
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
                        key={record.id}
                        className=""
                      >
                        <p>testing.....</p>
                      </Collapse.Panel>
                    </Collapse>
                  );
                }

                return (
                  <NavLink
                    to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
                    className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
                  >
                    <Typography.Text
                      strong
                      className="request-method"
                      style={{ color: REQUEST_METHOD_COLORS[record.data.request.method] }}
                    >
                      {record.data.request.method}
                    </Typography.Text>
                    <div className="request-url">{record.data.request.url || "echo"}</div>
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <EmptyCollectionList />
          )}
        </div>
      </div>
    </>
  );
};
