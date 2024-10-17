import React, { useCallback, useEffect, useState } from "react";
import { RQAPI } from "../../../../types";
import { NavLink, useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { Tabs, TabsProps, Tooltip } from "antd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "./collectionsList/CollectionsList";
import { HistoryList } from "./historyList/HistoryList";
import { ApiClientSidebarHeader } from "./apiClientSidebarHeader/ApiClientSidebarHeader";
import "./apiClientSidebar.scss";

interface Props {
  history: RQAPI.Entry[];
  onSelectionFromHistory: (index: number) => void;
  clearHistory: () => void;
  onNewClick: (src: RQAPI.AnalyticsEventSource) => void;
  onImportClick: () => void;
}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
}

const APIClientSidebar: React.FC<Props> = ({
  history,
  onSelectionFromHistory,
  clearHistory,
  onNewClick,
  onImportClick,
}) => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(ApiClientSidebarTabKey.COLLECTIONS);
  const [isNewRecordNameInputVisible, setIsNewRecordNameInputVisible] = useState(false);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType>();

  const hideNewRecordNameInput = () => {
    setIsNewRecordNameInputVisible(false);
    setRecordTypeToBeCreated(null);
  };

  const handleNewRecordClick = useCallback(
    (recordType: RQAPI.RecordType, analyticEventSource: RQAPI.AnalyticsEventSource) => {
      setIsNewRecordNameInputVisible(true);
      setRecordTypeToBeCreated(recordType);

      if (recordType === RQAPI.RecordType.API) {
        onNewClick(analyticEventSource);
      }
    },
    [onNewClick]
  );

  useEffect(() => {
    switch (location.pathname) {
      case PATHS.API_CLIENT.ABSOLUTE: {
        setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
        return;
      }
      case PATHS.API_CLIENT.HISTORY.ABSOLUTE: {
        setActiveKey(ApiClientSidebarTabKey.HISTORY);
        return;
      }
      default: {
        setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
        return;
      }
    }
  }, [location.pathname]);

  const items: TabsProps["items"] = [
    {
      key: ApiClientSidebarTabKey.COLLECTIONS,
      label: (
        <Tooltip title="Collections" placement="right">
          <NavLink
            to={PATHS.API_CLIENT.ABSOLUTE}
            className={({ isActive }) => `${isActive ? "active" : ""} api-client-tab-link`}
          >
            <BsCollection />
          </NavLink>
        </Tooltip>
      ),
      children: (
        <CollectionsList
          onNewClick={onNewClick}
          recordTypeToBeCreated={recordTypeToBeCreated}
          isNewRecordNameInputVisible={isNewRecordNameInputVisible}
          hideNewRecordNameInput={hideNewRecordNameInput}
        />
      ),
    },
    {
      key: ApiClientSidebarTabKey.HISTORY,
      label: (
        <Tooltip title="History" placement="right">
          <NavLink
            to={PATHS.API_CLIENT.HISTORY.ABSOLUTE}
            className={({ isActive }) => `${isActive ? "active" : ""} api-client-tab-link`}
          >
            <MdOutlineHistory />
          </NavLink>
        </Tooltip>
      ),
      children: <HistoryList history={history} onSelectionFromHistory={onSelectionFromHistory} />,
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  return (
    <div className="api-client-sidebar">
      <ApiClientSidebarHeader
        activeTab={activeKey}
        history={history}
        onClearHistory={clearHistory}
        onImportClick={onImportClick}
        onNewClick={(recordType) => handleNewRecordClick(recordType, "api_client_sidebar_header")}
      />

      <Tabs
        items={items}
        size="small"
        tabPosition="left"
        className="api-client-sidebar-tabs"
        activeKey={activeKey}
        onChange={handleActiveTabChange}
      />
    </div>
  );
};

export default APIClientSidebar;
