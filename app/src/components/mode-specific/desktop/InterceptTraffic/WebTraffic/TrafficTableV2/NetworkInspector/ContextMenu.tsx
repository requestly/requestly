import React, { ReactNode, useMemo } from "react";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

interface ContextMenuProps {
  children: ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const { RULE_TYPES } = GLOBAL_CONSTANTS;
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
        label: "Redirect URL(Map local/Remote)",
        key: RULE_TYPES.REDIRECT,
      },
      {
        label: "Modify Response Body",
        key: RULE_TYPES.RESPONSE,
      },
      {
        label: "Modify Request Body",
        key: RULE_TYPES.REQUEST,
      },
      {
        label: "Modify Headers",
        key: RULE_TYPES.HEADERS,
      },
      {
        label: "Replace part of URL",
        key: RULE_TYPES.REPLACE,
      },
      {
        label: "More modification options",
        key: "more_options",
        children: [
          {
            label: "Cancel Request",
            key: RULE_TYPES.CANCEL,
          },
          {
            label: "Insert Custom Script",
            key: RULE_TYPES.SCRIPT,
          },
          {
            label: "Delay Request",
            key: RULE_TYPES.DELAY,
          },
          {
            label: "Modify Query Params",
            key: RULE_TYPES.QUERYPARAM,
          },
          {
            label: "Modify User Agent",
            key: RULE_TYPES.USERAGENT,
          },
        ],
      },
    ],
    [RULE_TYPES]
  );
  return (
    <Dropdown menu={{ items }} trigger={["contextMenu"]}>
      {children}
    </Dropdown>
  );
};
