import React, { useCallback } from "react";
import { Button, Dropdown, Menu, Row, Typography } from "antd";
import config from "../../../config";
import ArrowDown from "../../../../resources/icons/arrowDown.svg";
import { sendEventFromPopup } from "../../../analytics/eventUtils";
import { EVENT_CONSTANTS } from "../../../analytics/eventContants";

interface PopupHeaderProps {
  isExtensionEnabled: boolean;
  handleToggleExtensionStatus: () => void;
}

const PopupHeader: React.FC<PopupHeaderProps> = ({
  isExtensionEnabled,
  handleToggleExtensionStatus,
}) => {
  const onOpenAppButtonClick = useCallback(() => {
    window.open(`${config.WEB_URL}/rules/my-rules?source=popup`, "_blank");
    sendEventFromPopup(EVENT_CONSTANTS.OPEN_APP_CLICKED);
  }, []);

  const items = (
    <Menu className="popup-header-dropdown-menu">
      <Menu.Item key="1" className="popup-header-dropdown-menu-item">
        <div>
          <Typography.Text type="secondary">
            When paused, rules won't be applied and sessions won't be recorded.
          </Typography.Text>
          <Button
            type="text"
            danger={!isExtensionEnabled}
            onClick={handleToggleExtensionStatus}
          >
            <span>{`${
              isExtensionEnabled ? "Pause" : "Resume"
            } requestly`}</span>
          </Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="popup-header">
      <div className="popup-header-workspace-section">
        <img
          className="product-logo"
          src="/resources/images/extended_logo.png"
        />
        {/* <Avatar shape="square" icon={<UserOutlined />} /> */}

        {/* <div className="popup-header-workspace-details">
          <Typography.Text strong>Personal’ workspace</Typography.Text>
          <Button
            type="link"
            target="_blank"
            className="popup-header-workspace-switch-btn"
            href={`${config.WEB_URL}/rules/my-rules?source=popup&workspace_switch=true`}
          >
            Switch
          </Button>
        </div> */}
      </div>

      <Row align="middle">
        <Dropdown overlay={items} placement="bottomRight">
          <Typography.Text type="secondary">
            <span className="popup-header-dropdown-text">
              <Typography.Text
                type={isExtensionEnabled ? "secondary" : "danger"}
              >
                {`Requestly ${isExtensionEnabled ? "running" : "paused"}`}
              </Typography.Text>
              <ArrowDown />
            </span>
          </Typography.Text>
        </Dropdown>

        <Button
          type="primary"
          className="open-app-btn"
          onClick={onOpenAppButtonClick}
        >
          Open app
        </Button>
      </Row>
    </div>
  );
};

export default PopupHeader;
