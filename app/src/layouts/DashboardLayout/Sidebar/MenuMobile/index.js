import React from "react";
import { Drawer } from "antd";
import { RiCloseFill } from "react-icons/ri";
import MenuLogo from "../MenuLogo";
import MenuItem from "../MenuItem";
import SideBarHeader from "../SideBarHeader";
import SidebarFooter from "../SidebarFooter";
import "./MenuMobile.css";

const MenuMobile = ({ onClose, visible, collapsed, setCollapsed }) => {
  return (
    <Drawer
      closable
      width={200}
      open={visible}
      placement="left"
      onClose={onClose}
      className="mobile-sidebar-container"
      title={<MenuLogo onClose={onClose} />}
      closeIcon={
        <RiCloseFill className="remix-icon hp-text-color-black-80" size={24} />
      }
    >
      <SideBarHeader
        isMobileMenu
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        handleMobileSidebarClose={onClose}
      />
      <MenuItem onClose={onClose} />
      <SidebarFooter collapsed={collapsed} handleMobileSidebarClose={onClose} />
    </Drawer>
  );
};

export default MenuMobile;
