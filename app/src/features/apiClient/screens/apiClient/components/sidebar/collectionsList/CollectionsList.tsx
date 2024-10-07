import React, { useCallback, useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
import { getApiRecords } from "backend/apiClient";
import Logger from "lib/logger";
import { Collapse, Tooltip, Typography } from "antd";
import placeholderImage from "../../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { RQButton } from "lib/design-system-v2/components";
import { NavLink } from "react-router-dom";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { CreateOrUpdateCollectionModal } from "./createOrUpdateCollectionModal/CreateOrUpdateCollectionModal";
import PATHS from "config/constants/sub/paths";
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

  const onNewRecord = useCallback((apiRecord: RQAPI.Record) => {
    setApiRecords((prev) => [...prev, { ...apiRecord }]);
  }, []);

  // const onRemoveRecord = useCallback((apiRecord: RQAPI.Record) => {
  //   setApiRecords((prev) => prev.filter((record) => record.id !== apiRecord.id));
  // }, []);

  const onUpdateRecord = useCallback((apiRecord: RQAPI.Record) => {
    setApiRecords((prev) => prev.map((record) => (record.id === apiRecord.id ? { ...record, ...apiRecord } : record)));
  }, []);

  const handleNewCollectionModalToggle = () => {
    setIsNewCollectionModalOpen(true);
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

  return (
    <>
      <CreateOrUpdateCollectionModal
        onNewRecord={onNewRecord}
        onUpdateRecord={onUpdateRecord}
        isOpen={isNewCollectionModalOpen}
        onClose={() => {
          setIsNewCollectionModalOpen(false);
        }}
      />

      <div className="collections-list-container">
        <div className="collections-list-header">
          <Tooltip title="Create new collection" placement="bottom">
            <RQButton
              icon={<MdAdd />}
              size="small"
              type="transparent"
              className="create-collection-btn"
              onClick={handleNewCollectionModalToggle}
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
                      <Collapse.Panel header={record.data.name} key={record.id} className="">
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
