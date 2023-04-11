import React, { ReactNode, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { copyToClipBoard } from "../../../../../../../utils/Misc";
import { actions } from "store";
import { RuleType } from "types";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import {
  trackTrafficTableDropdownClicked,
  trackTrafficTableRequestRightClicked,
} from "modules/analytics/events/desktopApp";
import "./index.css";

interface ContextMenuProps {
  log?: any;
  children: ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, log = {} }) => {
  // const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);

  // const toggleContextMenu = () => {
  //   setIsMenuOpen((prev) => !prev);
  // };

  const handleOnClick = useCallback(
    (menuInfo: Parameters<MenuProps["onClick"]>[0], log: any) => {
      dispatch(
        actions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: {
            ruleData: log,
            ruleType: menuInfo.key,
          },
        })
      );
      trackTrafficTableDropdownClicked(menuInfo.key);
      trackRuleCreationWorkflowStartedEvent(menuInfo.key, "modal");
    },
    [dispatch]
  );

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        key: "copy_curl",
        label: "Copy cURL",
        onClick: () => {
          copyToClipBoard(log.requestShellCurl, "cURL copied to clipboard");
          // toggleContextMenu();
          trackTrafficTableDropdownClicked("copy_curl");
        },
      },
      {
        key: "copy_url",
        label: "Copy URL",
        onClick: () => {
          copyToClipBoard(log.url, "URL copied to clipboard");
          // toggleContextMenu();
          trackTrafficTableDropdownClicked("copy_url");
        },
      },
      {
        type: "divider",
      },
      {
        key: RuleType.REDIRECT,
        label: "Redirect URL(Map local/Remote)",
        onClick: (menuInfo) => {
          handleOnClick(menuInfo, log);
          // toggleContextMenu();
        },
      },
      {
        key: RuleType.RESPONSE,
        label: "Modify Response Body",
        onClick: (menuInfo) => {
          handleOnClick(menuInfo, log);
          // toggleContextMenu();
        },
      },
      {
        key: RuleType.REQUEST,
        label: "Modify Request Body",
        onClick: (menuInfo) => {
          handleOnClick(menuInfo, log);
          // toggleContextMenu();
        },
      },
      {
        key: RuleType.HEADERS,
        label: "Modify Headers",
        onClick: (menuInfo) => {
          handleOnClick(menuInfo, log);
          // toggleContextMenu();
        },
      },
      {
        key: RuleType.REPLACE,
        label: "Replace part of URL",
        onClick: (menuInfo) => {
          handleOnClick(menuInfo, log);
          // toggleContextMenu();
        },
      },
      {
        label: "More modification options",
        key: "more_options",
        children: [
          {
            key: RuleType.CANCEL,
            label: "Cancel Request",
            onClick: (menuInfo) => {
              handleOnClick(menuInfo, log);
              // toggleContextMenu();
            },
          },
          {
            key: RuleType.SCRIPT,
            label: "Insert Custom Script",
            onClick: (menuInfo) => {
              handleOnClick(menuInfo, log);
              // toggleContextMenu();
            },
          },
          {
            key: RuleType.DELAY,
            label: "Delay Request",
            onClick: (menuInfo) => {
              handleOnClick(menuInfo, log);
              // toggleContextMenu();
            },
          },
          {
            key: RuleType.QUERYPARAM,
            label: "Modify Query Params",
            onClick: (menuInfo) => {
              handleOnClick(menuInfo, log);
              // toggleContextMenu();
            },
          },
          {
            key: RuleType.USERAGENT,
            label: "Modify User Agent",
            onClick: (menuInfo) => {
              handleOnClick(menuInfo, log);
              // toggleContextMenu();
            },
          },
        ],
      },
    ],
    [log, handleOnClick]
  );

  const handleDropdownOpenChange = (open: boolean) => {
    // toggleContextMenu();
    console.log({ open });
    if (open) {
      trackTrafficTableRequestRightClicked();
      if (!isTrafficTableTourCompleted) {
        dispatch(actions.updateTrafficTableTourCompleted({}));
      }
    }
  };

  return (
    <Dropdown
      menu={{ items }}
      autoFocus={true}
      trigger={["contextMenu"]}
      overlayClassName="traffic-table-context-menu"
      destroyPopupOnHide={true}
      onOpenChange={handleDropdownOpenChange}
    >
      {children}
    </Dropdown>
  );
};
