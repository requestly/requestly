import React, { useMemo } from "react";
import { Menu, Tooltip } from "antd";

interface GroupMenuItemProps {
  id: string;
  name: string;
  currentGroupId: string;
  handleMenuItemClick: () => void;
}

const GroupMenuItem: React.FC<GroupMenuItemProps> = ({ id = "", name, currentGroupId, handleMenuItemClick }) => {
  const menuItem = useMemo(
    () => (
      <Menu.Item
        key={id}
        onClick={handleMenuItemClick}
        className={`editor-group-menu-item ${id === currentGroupId ? "editor-group-menu-item-active" : ""}`}
      >
        <span>{name}</span>
        {id === currentGroupId && (
          <img
            width="9px"
            height="7px"
            alt="selected"
            src="/assets/media/common/tick.svg"
            className="editor-group-selected-icon"
          />
        )}
      </Menu.Item>
    ),
    [id, name, currentGroupId, handleMenuItemClick]
  );

  return name.length > 21 ? (
    <Tooltip title={name} placement="left" mouseEnterDelay={0.5}>
      {menuItem}
    </Tooltip>
  ) : (
    menuItem
  );
};

export default GroupMenuItem;
