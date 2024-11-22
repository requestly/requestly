import React from "react";
import { Input, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";
import "./sidebarListHeader.scss";

interface ListHeaderProps {
  onAddRecordClick: () => void;
  onSearch: (value: string) => void;
  menuItems?: MenuProps["items"];
}

export const SidebarListHeader: React.FC<ListHeaderProps> = ({ onAddRecordClick, onSearch, menuItems }) => {
  return (
    <div className="sidebar-list-header">
      <Input
        size="small"
        prefix={<SearchOutlined />}
        placeholder="Search"
        onChange={(e) => onSearch(e.target.value)}
        className="sidebar-list-header-search"
      />

      {menuItems && (
        <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
          <RQButton size="small" type="transparent" icon={<MoreOutlined />} className="sidebar-list-header-button" />
        </Dropdown>
      )}
    </div>
  );
};
