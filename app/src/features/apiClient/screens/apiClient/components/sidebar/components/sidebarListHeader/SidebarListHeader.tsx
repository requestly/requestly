import React from "react";
import { Input, Dropdown, Menu } from "antd";
import { PlusOutlined, SearchOutlined, MoreOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";
import "./sidebarListHeader.scss";

interface ListHeaderProps {
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  menuItems?: { key: string; label: string; onClick: () => void }[];
}

export const SidebarListHeader: React.FC<ListHeaderProps> = ({ onAdd, onSearch, menuItems }) => {
  const menu = menuItems ? (
    <Menu>
      {menuItems.map((item) => (
        <Menu.Item key={item.key} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  ) : null;

  return (
    <div className="sidebar-list-header">
      {onAdd && (
        <RQButton
          size="small"
          type="transparent"
          icon={<PlusOutlined />}
          onClick={onAdd}
          className="sidebar-list-header-button"
        />
      )}
      {onSearch && (
        <Input
          size="small"
          prefix={<SearchOutlined />}
          placeholder="Search"
          onChange={(e) => onSearch(e.target.value)}
          className="sidebar-list-header-search"
        />
      )}
      {menu && (
        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
          <RQButton size="small" type="transparent" icon={<MoreOutlined />} className="sidebar-list-header-button" />
        </Dropdown>
      )}
    </div>
  );
};
