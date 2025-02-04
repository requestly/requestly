import React from "react";
import { Input, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";
import { BiSelectMultiple } from "@react-icons/all-files/bi/BiSelectMultiple";
import "./sidebarListHeader.scss";

interface ListHeaderProps {
  onSearch: (value: string) => void;
  menuItems?: MenuProps["items"];
  multiSelectOptions?: {
    showMultiSelect: boolean;
    toggleMultiSelect: () => void;
  };
}

export const SidebarListHeader: React.FC<ListHeaderProps> = ({ onSearch, menuItems, multiSelectOptions }) => {
  const { showMultiSelect = false, toggleMultiSelect } = multiSelectOptions || {};
  return (
    <div className="sidebar-list-header">
      {showMultiSelect && <BiSelectMultiple size={"18px"} onClick={toggleMultiSelect} />}
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
