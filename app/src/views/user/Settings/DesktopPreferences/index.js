import React, { useState } from "react";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Alert, Button, Col, Input, Popconfirm, Row } from "antd";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { LinkOutlined } from "@ant-design/icons";
import {
  trackProxyPortChanged,
  trackInvalidProxyPortInput,
  trackUserDeniedClosingLaunchedApps,
  trackProxyPortChangeRequested,
} from "modules/analytics/events/desktopApp";
import { toast } from "utils/Toast";
import "./DesktopPreference.css";

const DesktopPreference = ({ appMode }) => {
  const [portInput, setPortInput] = useState("");
  const [portSubmitLoading, setPortSubmitLoading] = useState(false);

  const closeInterceptingApps = () => {
    if (window.RQ && window.RQ && window.RQ.DESKTOP) {
      return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(
        "deactivate-traffic-sources",
        {}
      );
    }
  };

  const handlePortChange = async () => {
    const isValidPort = (portString) => {
      const port = parseInt(portString);
      return !isNaN(port) && 1024 < port && port <= 65536;
    };

    const setNewPort = (port) => {
      // make IPC call
      return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(
        "rq-storage:storage-action",
        {
          type: "USER_PREFERENCE:UPDATE_DEFAULT_PORT",
          payload: { data: port },
        }
      );
    };

    setPortSubmitLoading(true);
    const newPort = portInput;

    if (isValidPort(newPort)) {
      await closeInterceptingApps();
      await setNewPort(parseInt(newPort));

      toast.success(
        `Default port changed to ${newPort}. Restart app to start proxy on the new port`
      );
      trackProxyPortChanged(newPort);
    } else {
      toast.error(`Please use a valid port number`);
      trackInvalidProxyPortInput(newPort);
    }
    setPortSubmitLoading(false);
  };

  // add loader
  return appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
    <>
      <div className="settings-header header">🖥️ Desktop Settings</div>
      <p className="text-gray text-sm settings-caption">
        Following are desktop preference settings
      </p>

      <div>
        {isFeatureCompatible(FEATURES.DESKTOP_USER_PREFERENCES) ? (
          <Row className="w-full" align="middle" gutter={8}>
            <Col
              span={13}
              xs={{ span: 17 }}
              sm={{ span: 16 }}
              md={{ span: 15 }}
              lg={{ span: 14 }}
              xl={{ span: 13 }}
              flex="0 1 420px"
              align="left"
            >
              <label className="caption text-bold desktop-setting-port-input-label">
                Set default proxy port
              </label>
              <Input
                value={portInput}
                disabled={portSubmitLoading}
                placeholder="Enter New Port"
                className="desktop-setting-port-input"
                onChange={(e) => setPortInput(e.target.value)}
              />

              <Popconfirm
                okText="Continue"
                cancelText="No"
                placement="topLeft"
                title="Browsers launched from Requestly will be closed. Do you want to proceed?"
                onConfirm={handlePortChange}
                onCancel={trackUserDeniedClosingLaunchedApps}
              >
                <Button
                  className="desktop-port-update-btn"
                  onClick={trackProxyPortChangeRequested}
                >
                  Update
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        ) : (
          <Row className="w-full" align="middle" gutter={8}>
            <Alert
              message="Upgrade to latest version"
              description="You will be able to edit preferences like proxy port only on the latest version of the desktop app. Please get the latest release from our website here 👉🏻"
              type="info"
              showIcon
              action={
                <Button type="link" size="small" icon={<LinkOutlined />}>
                  https://requestly.io/desktop
                </Button>
              }
            />
          </Row>
        )}
      </div>
    </>
  ) : null;
};

export default DesktopPreference;
