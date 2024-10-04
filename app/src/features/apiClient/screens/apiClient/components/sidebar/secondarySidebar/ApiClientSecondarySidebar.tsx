import React from "react";
import "./apiClientSecondarySidebar.scss";
import { ApiOutlined } from "@ant-design/icons";

export enum SecondarySidebarItemKey {
  COLLECTIONS = "collections",
  HISTORY = "history",
}

interface Props {
  activeTab: SecondarySidebarItemKey;
  onSecondarySidebarTabChange: React.Dispatch<React.SetStateAction<SecondarySidebarItemKey>>;
}

export const ApiClientSecondarySidebar: React.FC<Props> = ({ activeTab, onSecondarySidebarTabChange }) => {
  const items = [
    {
      key: SecondarySidebarItemKey.COLLECTIONS,
      title: "Collections",
      icon: <ApiOutlined />,
    },
    {
      key: SecondarySidebarItemKey.HISTORY,
      title: "History",
      icon: <ApiOutlined />,
    },
  ];

  return (
    <div className="api-client-secondary-sidebar">
      {items.map(({ key, title, icon }) => {
        return (
          <div
            className={`sidebar-item ${activeTab === key ? "active" : ""}`}
            onClick={() => {
              onSecondarySidebarTabChange(key);
            }}
          >
            <span className="item-icon">{icon}</span>
            {title}
          </div>
        );
      })}
    </div>
  );
};
