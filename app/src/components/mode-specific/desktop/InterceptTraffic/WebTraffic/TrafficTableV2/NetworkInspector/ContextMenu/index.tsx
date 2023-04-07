import React, { ReactNode, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { actions } from "store";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { copyToClipBoard } from "../../../../../../../../utils/Misc";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.css";

interface ContextMenuProps {
  children: ReactNode;
  log: any;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, log }) => {
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(
    getIsTrafficTableTourCompleted
  );
  const { RULE_TYPES } = GLOBAL_CONSTANTS;
  const items: MenuProps["items"] = useMemo(
    () => [
      {
        label: "Copy cURL",
        key: "copy_curl",
        onClick: () =>
          copyToClipBoard(log.requestShellCurl, "cURL copied to clipboard"),
      },
      {
        label: "Copy URL",
        key: "copy_url",
        onClick: () => copyToClipBoard(log.url, "URL copied to clipboard"),
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
    [RULE_TYPES, log.url, log.requestShellCurl]
  );

  const handleDropdownOpenChange = (open: boolean) => {
    if (open && !isTrafficTableTourCompleted) {
      dispatch(actions.updateTrafficTableTourCompleted({}));
    }
  };

  return (
    <Dropdown
      menu={{ items }}
      trigger={["contextMenu"]}
      overlayClassName="traffic-table-context-menu"
      destroyPopupOnHide={true}
      onOpenChange={handleDropdownOpenChange}
    >
      {children}
    </Dropdown>
  );
};
