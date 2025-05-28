import React, { ReactNode, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { copyToClipBoard } from "../../../../../../../../utils/Misc";
import { globalActions } from "store/slices/global/slice";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import {
  trackTrafficTableDropdownClicked,
  trackTrafficTableRequestRightClicked,
} from "modules/analytics/events/desktopApp";
import { trackWalkthroughCompleted } from "modules/analytics/events/misc/productWalkthrough";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { getLogResponseById } from "store/features/desktop-traffic-table/selectors";
import "./index.css";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { TRAFFIC_TABLE } from "modules/analytics/events/desktopApp/constants";
import { RuleType } from "@requestly/shared/types/entities/rules";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { LocalWorkspaceTooltip } from "features/apiClient/screens/apiClient/components/clientView/components/LocalWorkspaceTooltip/LocalWorkspaceTooltip";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/types";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

interface ContextMenuProps {
  log: any;
  children: ReactNode;
  onReplayRequest: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, log = {}, onReplayRequest }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);
  const selectedRequestResponse = useSelector(getLogResponseById(log?.id)) || log?.response?.body;
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  const handleOnClick = useCallback(
    (menuInfo: Parameters<MenuProps["onClick"]>[0], log: any) => {
      dispatch(
        globalActions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: {
            ruleData: { ...log, response: { ...(log?.response ?? {}), body: selectedRequestResponse } },
            ruleType: menuInfo.key,
          },
        })
      );
      trackTrafficTableDropdownClicked(menuInfo.key);
      trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_DROPDOWN_CLICKED);
      trackRuleCreationWorkflowStartedEvent(menuInfo.key, "modal");
    },
    [dispatch, selectedRequestResponse]
  );

  const isContextMenuOptionDisabled = user.loggedIn ? isLocalSyncEnabled : true;

  const items: MenuProps["items"] = useMemo(() => {
    const menuItems: MenuProps["items"] = [
      {
        key: "copy_curl",
        label: <LocalWorkspaceTooltip featureName="Copy cURL">Copy cURL</LocalWorkspaceTooltip>,
        onClick: () => {
          copyToClipBoard(log.requestShellCurl, "cURL copied to clipboard");
          trackTrafficTableDropdownClicked("copy_curl");
          trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_DROPDOWN_CLICKED);
        },
      },
      {
        key: "copy_url",
        label: <LocalWorkspaceTooltip featureName="Copy URL">Copy URL</LocalWorkspaceTooltip>,
        onClick: () => {
          copyToClipBoard(log.url, "URL copied to clipboard");
          trackTrafficTableDropdownClicked("copy_url");
          trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_DROPDOWN_CLICKED);
        },
      },
      {
        type: "divider",
      },
      {
        key: RuleType.REDIRECT,
        label: (
          <LocalWorkspaceTooltip featureName="Redirect URL">Redirect URL (Map local/Remote)</LocalWorkspaceTooltip>
        ),
        disabled: isContextMenuOptionDisabled,
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.RESPONSE,
        label: <LocalWorkspaceTooltip featureName="Modify Response Body">Modify Response Body</LocalWorkspaceTooltip>,
        disabled: isContextMenuOptionDisabled,
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REQUEST,
        label: <LocalWorkspaceTooltip featureName="Modify Request Body">Modify Request Body</LocalWorkspaceTooltip>,
        disabled: isContextMenuOptionDisabled,
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.HEADERS,
        label: <LocalWorkspaceTooltip featureName="Modify Headers">Modify Headers</LocalWorkspaceTooltip>,
        disabled: isContextMenuOptionDisabled,
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        key: RuleType.REPLACE,
        label: <LocalWorkspaceTooltip featureName="Replace part of URL">Replace part of URL</LocalWorkspaceTooltip>,
        disabled: isContextMenuOptionDisabled,
        onClick: (menuInfo) => handleOnClick(menuInfo, log),
      },
      {
        label: (
          <LocalWorkspaceTooltip featureName="More modification options">
            More modification options
          </LocalWorkspaceTooltip>
        ),
        key: "more_options",
        disabled: isContextMenuOptionDisabled,
        children: [
          {
            key: RuleType.CANCEL,
            label: <LocalWorkspaceTooltip featureName="Cancel Request">Cancel Request</LocalWorkspaceTooltip>,
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.SCRIPT,
            label: (
              <LocalWorkspaceTooltip featureName="Insert Custom Script">Insert Custom Script</LocalWorkspaceTooltip>
            ),
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.DELAY,
            label: <LocalWorkspaceTooltip featureName="Delay Request">Delay Request</LocalWorkspaceTooltip>,
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.QUERYPARAM,
            label: <LocalWorkspaceTooltip featureName="Modify Query Params">Modify Query Params</LocalWorkspaceTooltip>,
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
          {
            key: RuleType.USERAGENT,
            label: <LocalWorkspaceTooltip featureName="Modify User Agent">Modify User Agent</LocalWorkspaceTooltip>,
            onClick: (menuInfo) => handleOnClick(menuInfo, log),
          },
        ],
      },
    ];

    if (isFeatureCompatible(FEATURES.API_CLIENT)) {
      menuItems.splice(2, 0, {
        key: "replay_request",
        label: "Edit and Replay",
        onClick: () => {
          trackTrafficTableDropdownClicked("replay_request");
          trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_DROPDOWN_CLICKED);
          onReplayRequest();
        },
      });
    }

    if (!log.requestShellCurl) {
      menuItems.splice(0, 1);
    }

    return menuItems;
  }, [log, onReplayRequest, handleOnClick, isContextMenuOptionDisabled]);

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      trackTrafficTableRequestRightClicked();
      trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_RIGHT_CLICKED);
      if (!isTrafficTableTourCompleted) {
        dispatch(globalActions.updateProductTourCompleted({ tour: TOUR_TYPES.TRAFFIC_TABLE }));
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
