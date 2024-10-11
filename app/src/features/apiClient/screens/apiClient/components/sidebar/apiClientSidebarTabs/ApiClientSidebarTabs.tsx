import React from "react";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { Tabs, TabsProps, Tooltip } from "antd";
import { RQAPI } from "features/apiClient/types";
import { CollectionsList } from "./collectionsList/CollectionsList";
import { HistoryList } from "./historyList/HistoryList";
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
  const items: TabsProps["items"] = [
    {
      key: ApiClientSidebarTabKey.COLLECTIONS,
      label: (
        <Tooltip title="Collections" placement="right">
          <div className="api-client-tab-label">
            <BsCollection />
          </div>
        </Tooltip>
      ),
      children: <CollectionsList onNewClick={onNewClick} onImportClick={onImportClick} />,
    },
    {
      key: ApiClientSidebarTabKey.HISTORY,
      label: (
        <Tooltip title="History" placement="right">
          <div className="api-client-tab-label">
            <MdOutlineHistory />
          </div>
        </Tooltip>
      ),
      children: (
        <HistoryList history={history} onSelectionFromHistory={onSelectionFromHistory} onClearHistory={clearHistory} />
      ),
    },
  ];

  return <Tabs tabPosition="left" size="small" className="api-client-sidebar-tabs" items={items} />;
};
