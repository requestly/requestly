import React, { useCallback } from "react";
import { Button, Dropdown, Menu, Row, Typography } from "antd";
import config from "../../../config";
import ArrowDown from "../../../../resources/icons/arrowDown.svg";
import { EVENT, sendEvent } from "../../events";

interface PopupHeaderProps {
  isExtensionEnabled: boolean;
  handleToggleExtensionStatus: () => void;
  handleToggleProxyStatus: () => void;
  checkingProxyStatus: boolean;
  isProxyEnabled: boolean;
  isProxyRunning: boolean;
}

const PopupHeader: React.FC<PopupHeaderProps> = ({
  isExtensionEnabled,
  handleToggleExtensionStatus,
  checkingProxyStatus,
  isProxyEnabled,
  isProxyRunning,
  handleToggleProxyStatus,
}) => {
  const onOpenAppButtonClick = useCallback(() => {
    window.open(`${config.WEB_URL}/rules/my-rules?source=popup`, "_blank");
    sendEvent(EVENT.OPEN_APP_CLICKED);
  }, []);

  // customProtocolCheck(
  //   "requestly://params",
  //   () => {
  //     console.log("Custom protocol not found.");
  //   },
  //   () => {
  //     console.log("Custom protocol found and opened the file successfully.");
  //   }, 5000
  // );

  const items = (
    <Menu className="popup-header-dropdown-menu">
      <Menu.Item key="1" className="popup-header-dropdown-menu-item">
        <div>
          <Typography.Text type="secondary">
            When paused, rules won't be applied and sessions won't be recorded.
          </Typography.Text>
          <Button type="text" danger={!isProxyEnabled} onClick={handleToggleProxyStatus}>
            <span>{`${isProxyEnabled ? "Pause" : "Resume"} requestly`}</span>
          </Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  const renderProxyCTA = () => {
    const items1 = (
      <Menu className="popup-header-dropdown-menu">
        <Menu.Item key="1" className="popup-header-dropdown-menu-item">
          <div>
            <Typography.Text type="secondary">
              Requestly Proxy isn't running. Launch Desktop App to start proxy
            </Typography.Text>
            <Button
              type="text"
              onClick={() => {
                window.open("requestly://");
              }}
            >
              Launch
            </Button>
          </div>
        </Menu.Item>
      </Menu>
    );

    console.log(isProxyRunning, isProxyEnabled);
    if (!isProxyRunning) {
      return (
        <Dropdown overlay={items1} placement="bottomRight">
          <Typography.Text type="secondary">
            <span className="popup-header-dropdown-text">
              <Typography.Text type="warning">Proxy Not Running</Typography.Text>
              <ArrowDown />
            </span>
          </Typography.Text>
        </Dropdown>
      );
    } else {
      return (
        <Dropdown overlay={items} placement="bottomRight">
          <Typography.Text type="secondary">
            <span className="popup-header-dropdown-text">
              <Typography.Text type={isProxyEnabled ? "secondary" : "danger"}>
                {`Requestly ${isProxyEnabled ? "running" : "paused"}`}
              </Typography.Text>
              <ArrowDown />
            </span>
          </Typography.Text>
        </Dropdown>
      );
    }
  };

  return (
    <div className="popup-header">
      <div className="popup-header-workspace-section">
        <img className="product-logo" src="/resources/images/extended_logo.png" />
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
        {/* <Dropdown overlay={items} placement="bottomRight">
          <Typography.Text type="secondary">
            <span className="popup-header-dropdown-text">
              <Typography.Text type={isExtensionEnabled ? "secondary" : "danger"}>
                {`Requestly ${isExtensionEnabled ? "running" : "paused"}`}
              </Typography.Text>
              <ArrowDown />
            </span>
          </Typography.Text>
        </Dropdown> */}
        {renderProxyCTA()}

        <Button type="primary" className="open-app-btn" onClick={onOpenAppButtonClick}>
          Open app
        </Button>
      </Row>
    </div>
  );
};

export default PopupHeader;
