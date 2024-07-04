import React, { useCallback } from "react";
import { Button, Col, Row, Switch, Typography, Tooltip } from "antd";
import config from "../../../config";
import { EVENT, sendEvent } from "../../events";

interface PopupHeaderProps {
  isExtensionEnabled: boolean;
  handleToggleExtensionStatus: () => void;
}

const PopupHeader: React.FC<PopupHeaderProps> = ({ isExtensionEnabled, handleToggleExtensionStatus }) => {
  const onOpenAppButtonClick = useCallback(() => {
    window.open(`${config.SESSIONS_URL}?source=popup`, "_blank");
    sendEvent(EVENT.OPEN_APP_CLICKED);
  }, []);

  return (
    <div className="popup-header">
      <div className="popup-header-workspace-section">
        <img className="product-logo" src="/resources/images/extended_logo.png" />
      </div>

      <Row align="middle" gutter={16}>
        <Col>
          <Row align="middle">
            <Tooltip
              open={!isExtensionEnabled}
              title="When OFF, sessions won't be recorded."
              overlayClassName="enable-extension-tooltip"
              color="var(--neutrals-black)"
              overlayInnerStyle={{ fontSize: "14px" }}
            >
              <Switch
                checked={isExtensionEnabled}
                onChange={handleToggleExtensionStatus}
                size="small"
                className="pause-switch"
              />
            </Tooltip>
            <Typography.Text>{`SessionBear ${isExtensionEnabled ? "ON" : "OFF"}`}</Typography.Text>
          </Row>
        </Col>
        <Col>
          <Button type="primary" className="open-app-btn" onClick={onOpenAppButtonClick}>
            Open app
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PopupHeader;
