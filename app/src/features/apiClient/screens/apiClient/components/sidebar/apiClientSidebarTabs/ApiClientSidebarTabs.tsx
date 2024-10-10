import React from "react";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { Tabs, TabsProps } from "antd";
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
        <div className="api-client-tab-label">
          <BsCollection /> Collections
        </div>
      ),
      children: <CollectionsList onNewClick={onNewClick} onImportClick={onImportClick} />,
    },
    {
      key: ApiClientSidebarTabKey.HISTORY,
      label: (
        <div className="api-client-tab-label">
          <MdOutlineHistory /> History
        </div>
      ),
      children: (
        <HistoryList history={history} onSelectionFromHistory={onSelectionFromHistory} onClearHistory={clearHistory} />
      ),
    },
  ];

  return <Tabs size="small" className="api-client-sidebar-tabs" items={items} />;
};
