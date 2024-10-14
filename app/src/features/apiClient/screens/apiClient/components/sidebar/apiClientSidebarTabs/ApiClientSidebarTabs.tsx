import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { Tabs, TabsProps, Tooltip } from "antd";
import { RQAPI } from "features/apiClient/types";
import { CollectionsList } from "./collectionsList/CollectionsList";
import { HistoryList } from "./historyList/HistoryList";
import PATHS from "config/constants/sub/paths";
import "./apiClientSidebarTabs.scss";

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
}

interface Props {
  history: RQAPI.Entry[];
  onSelectionFromHistory: (index: number) => void;
  clearHistory: () => void;
  onNewClick: () => void;
  onImportClick: () => void;
}

export const ApiClientSidebarTabs: React.FC<Props> = ({
  history,
  onSelectionFromHistory,
  clearHistory,
  onNewClick,
  onImportClick,
}) => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(ApiClientSidebarTabKey.COLLECTIONS);

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
      children: <CollectionsList onNewClick={onNewClick} onImportClick={onImportClick} />,
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
      children: (
        <HistoryList history={history} onSelectionFromHistory={onSelectionFromHistory} onClearHistory={clearHistory} />
      ),
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  return (
    <Tabs
      items={items}
      size="small"
      tabPosition="left"
      className="api-client-sidebar-tabs"
      activeKey={activeKey}
      onChange={handleActiveTabChange}
    />
  );
};
