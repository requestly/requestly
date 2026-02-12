import React from "react";
import { Conditional } from "components/common/Conditional";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../constants/keyboardShortcuts";
import { Dropdown, MenuProps, Tooltip } from "antd";
import { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MdOutlineDashboardCustomize } from "@react-icons/all-files/md/MdOutlineDashboardCustomize";
import { useRBAC } from "features/rbac";
import "./saveRequestButton.scss";

interface Props {
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  enableHotkey?: boolean;
  onClick: () => void;
}

export const SaveRequestButton: React.FC<Props> = ({ hidden, disabled, loading, enableHotkey, onClick }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const saveMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "save_as_example",
        icon: <MdOutlineDashboardCustomize />,
        label: "Save as example",
        disabled: !isValidPermission,
        onClick: () => {},
      },
    ],
    [isValidPermission]
  );

  return (
    <Conditional condition={!hidden}>
      <Tooltip
        title={
          !isValidPermission
            ? "Saving is not allowed in view-only mode. You can update and view changes but cannot save them."
            : undefined
        }
        placement="topLeft"
        color="#000"
      >
        <span className="api-client-save-request-button-container">
          <RQButton
            onClick={onClick}
            disabled={disabled || !isValidPermission}
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST!.hotKey}
            loading={loading}
            className="api-client-save-request-button"
            enableHotKey={enableHotkey}
          >
            Save
          </RQButton>
          <Dropdown
            disabled={!isValidPermission}
            overlayClassName="api-client-save-request-dropdown"
            menu={{ items: saveMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <RQButton className="api-client-save-request-dropdown-button">
              <MdOutlineKeyboardArrowDown />
            </RQButton>
          </Dropdown>
        </span>
      </Tooltip>
    </Conditional>
  );
};
