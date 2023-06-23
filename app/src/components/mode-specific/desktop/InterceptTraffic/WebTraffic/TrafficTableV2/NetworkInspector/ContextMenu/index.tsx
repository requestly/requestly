import React, { ReactNode, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { copyToClipBoard } from "../../../../../../../../utils/Misc";
import { actions } from "store";
import { RuleType } from "types";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import {
  trackTrafficTableDropdownClicked,
  trackTrafficTableRequestRightClicked,
} from "modules/analytics/events/desktopApp";
import { trackWalkthroughCompleted } from "modules/analytics/events/misc/productWalkthrough";
import FEATURES from "config/constants/sub/features";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import BetaBadge from "components/misc/BetaBadge";
import { getLogResponseById } from "store/features/desktop-traffic-table/selectors";
import "./index.css";

interface ContextMenuProps {
  log: any;
  children: ReactNode;
  onReplayRequest: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, log = {}, onReplayRequest }) => {
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);
  const selectedRequestResponse = useSelector(getLogResponseById(log?.id)) || log?.response?.body;

  const handleOnClick = useCallback(
    (menuInfo: Parameters<MenuProps["onClick"]>[0], log: any) => {
      dispatch(
        actions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: {
            ruleData: { ...log, response: { ...(log?.response ?? {}), body: selectedRequestResponse } },
            ruleType: menuInfo.key,
          },
        })
      );
      trackTrafficTableDropdownClicked(menuInfo.key);
      trackRuleCreationWorkflowStartedEvent(menuInfo.key, "modal");
    },
    [dispatch, selectedRequestResponse]
  );

  const items: MenuProps["items"] = useMemo(() => {
    const menuItems: MenuProps["items"] = [
      {
        key: "copy_curl",
        label: "Copy cURL",
        onClick: () => {
          copyToClipBoard(log.requestShellCurl, "cURL copied to clipboard");
          trackTrafficTableDropdownClicked("copy_curl");
        },
      },
      {
        key: "copy_url",
        label: "Copy URL",
        onClick: () => {
          copyToClipBoard(log.url, "URL copied to clipboard");
          trackTrafficTableDropdownClicked("copy_url");
        },
      },
      {
        type: "divider",
      },
      {
        key: RuleType.REDIRECT,
        label: "Redirect URL(Map local/Remote)",
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.RESPONSE,
        label: "Modify Response Body",
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REQUEST,
        label: "Modify Request Body",
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.HEADERS,
        label: "Modify Headers",
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REPLACE,
        label: "Replace part of URL",
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        label: "More modification options",
        key: "more_options",
        children: [
          {
            key: RuleType.CANCEL,
            label: "Cancel Request",
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.SCRIPT,
            label: "Insert Custom Script",
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.DELAY,
            label: "Delay Request",
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.QUERYPARAM,
            label: "Modify Query Params",
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.USERAGENT,
            label: "Modify User Agent",
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
        ],
      },
    ];

    if (isFeatureCompatible(FEATURES.API_CLIENT)) {
      menuItems.splice(2, 0, {
        key: "replay_request",
        label: <BetaBadge text="Edit and Replay" />,
        onClick: () => {
          trackTrafficTableDropdownClicked("replay_request");
          onReplayRequest();
        },
      });
    }

    if (!log.requestShellCurl) {
      menuItems.splice(0, 1);
    }

    return menuItems;
  }, [log, onReplayRequest, handleOnClick]);

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      trackTrafficTableRequestRightClicked();
      if (!isTrafficTableTourCompleted) {
        dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.TRAFFIC_TABLE }));
        trackWalkthroughCompleted(FEATURES.DESKTOP_APP_TRAFFIC_TABLE);
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
