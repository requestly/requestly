import React, { ReactNode, useMemo } from "react";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";

interface ContextMenuProps {
  children: ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }: any) => {
  const items: MenuProps["items"] = useMemo(
    () => [
      {
        label: "Copy cURL",
        key: "copy_curl",
      },
      {
        label: "Copy URL",
        key: "copy_url",
      },
      {
        label: "3rd menu item",
        key: "3",
      },
    ],
    []
  );
  return (
    <Dropdown menu={{ items }} trigger={["contextMenu"]}>
      {children}
    </Dropdown>
  );
};
