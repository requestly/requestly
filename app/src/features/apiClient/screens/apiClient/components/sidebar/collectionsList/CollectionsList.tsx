import React, { useCallback, useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
import { getApiRecords } from "backend/apiClient";
import Logger from "lib/logger";
import { Collapse, Dropdown, MenuProps, Tooltip, Typography } from "antd";
import placeholderImage from "../../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { RQButton } from "lib/design-system-v2/components";
import { NavLink } from "react-router-dom";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { CreateOrUpdateCollectionModal } from "./createOrUpdateCollectionModal/CreateOrUpdateCollectionModal";
import PATHS from "config/constants/sub/paths";
import { isRequest } from "../../../utils";
import "./collectionsList.scss";

interface Props {}

export const CollectionsList: React.FC<Props> = () => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const [isLoadingApiRecords, setIsLoadingApiRecords] = useState(false);
  const [apiRecords, setApiRecords] = useState<RQAPI.Record[]>([]);
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  const [collectionToBeUpdate, setCollectionToBeUpdate] = useState<RQAPI.CollectionRecord>();

  const onNewRecord = useCallback((apiRecord: RQAPI.Record) => {
    setApiRecords((prev) => [...prev, { ...apiRecord }]);
  }, []);

  // const onRemoveRecord = useCallback((apiRecord: RQAPI.Record) => {
  //   setApiRecords((prev) => prev.filter((record) => record.id !== apiRecord.id));
  // }, []);

  const onUpdateRecord = useCallback((apiRecord: RQAPI.Record) => {
    setApiRecords((prev) => prev.map((record) => (record.id === apiRecord.id ? { ...record, ...apiRecord } : record)));
  }, []);

  const openNewCollectionModal = () => {
    setIsNewCollectionModalOpen(true);
  };

  const closeNewCollectionModal = () => {
    setIsNewCollectionModalOpen(false);
    setCollectionToBeUpdate(null);
  };

  useEffect(() => {
    if (!uid) {
      return;
    }

    setIsLoadingApiRecords(true);
    getApiRecords(uid, teamId)
      .then((result) => {
        if (result.success) {
          setApiRecords(result.data);
        }
      })
      .catch((error) => {
        setApiRecords([]);
        Logger.error("Error loading api records!", error);
      })
      .finally(() => {
        setIsLoadingApiRecords(false);
      });
  }, [uid, teamId]);

  // const prepareRecordsToRender = (records: RQAPI.Record[]) => {
  //   const requests = [];
  //   const collections = [];

  //   records.forEach((record) => {
  //     if (isRequest(record)) {
  //       requests.push(record);
  //     } else {
  //       collections.push(record);
  //     }
  //   });
  // };

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
          openNewCollectionModal();
          setCollectionToBeUpdate(record);
        },
      },
      {
        key: "2",
        label: <div>Delete collection</div>,
        danger: true,
        onClick: (itemInfo) => {
          itemInfo.domEvent?.stopPropagation?.();
          openNewCollectionModal();
          setCollectionToBeUpdate(record);
        },
      },
    ];

    return items;
  }, []);

  return (
    <>
      {isNewCollectionModalOpen ? (
        <CreateOrUpdateCollectionModal
          onNewRecord={onNewRecord}
          onUpdateRecord={onUpdateRecord}
          isOpen={isNewCollectionModalOpen}
          collectionToBeUpdate={collectionToBeUpdate}
          onClose={closeNewCollectionModal}
        />
      ) : null}

      <div className="collections-list-container">
        <div className="collections-list-header">
          <Tooltip title="Create new collection" placement="bottom">
            <RQButton
              icon={<MdAdd />}
              size="small"
              type="transparent"
              className="create-collection-btn"
              onClick={openNewCollectionModal}
            >
              New collection
            </RQButton>
          </Tooltip>
        </div>

        <div className="collections-list-content">
          {isLoadingApiRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : apiRecords.length > 0 ? (
            <div className="collections-list">
              {apiRecords.map((record) => {
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
                    {record.data.request.url}
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="api-client-sidebar-placeholder">
              <img src={placeholderImage} alt="empty" />
              <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
