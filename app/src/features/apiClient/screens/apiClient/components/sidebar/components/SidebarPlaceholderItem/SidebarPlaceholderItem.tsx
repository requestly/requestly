import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import "./sidebarPlaceholderItem.scss";

interface SidebarPlaceholderItemProps {
  name: string;
}

export const SidebarPlaceholderItem: React.FC<SidebarPlaceholderItemProps> = ({ name }) => {
  return (
    <div className="api-client-sidebar-placeholder-item">
      <div className="api-client-sidebar-placeholder-item-name">{name}</div>
      <Spin indicator={<LoadingOutlined spin />} size="small" />
    </div>
  );
};
