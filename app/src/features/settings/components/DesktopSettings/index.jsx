import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Alert, Button, Col, Input, Popconfirm, Row, Tooltip } from "antd";
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
import { trackSettingsToggled } from "modules/analytics/events/misc/settings";
import { RQButton } from "lib/design-system/components";
import "./DesktopSettings.css";
import LocalLogFile from "./LocalLogFile";

export const DesktopSettings = () => {
  const appMode = useSelector(getAppMode);
  const [portInput, setPortInput] = useState("");
  const [portSubmitLoading, setPortSubmitLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlSubmitLoading, setUrlSubmitLoading] = useState(false);

  const closeInterceptingApps = () => {
    if (window.RQ && window.RQ && window.RQ.DESKTOP) {
      return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-traffic-sources", {});
    }
  };

  const handlePortChange = async () => {
    const isValidPort = (portString) => {
      const port = parseInt(portString);
      return !isNaN(port) && 1024 < port && port <= 65536;
    };

    const setNewPort = (port) => {
      // make IPC call
      return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("rq-storage:storage-action", {
        type: "USER_PREFERENCE:UPDATE_DEFAULT_PORT",
        payload: { data: port },
      });
    };

    setPortSubmitLoading(true);
    const newPort = portInput;

    if (isValidPort(newPort)) {
      await closeInterceptingApps();
      await setNewPort(parseInt(newPort));

      toast.success(`Default port changed to ${newPort}. Restart app to start proxy on the new port`);
      trackProxyPortChanged(newPort);
    } else {
      toast.error(`Please use a valid port number`);
      trackInvalidProxyPortInput(newPort);
    }
    trackSettingsToggled("port_changed", newPort);
    setPortSubmitLoading(false);
  };

  const regenerateRootCa = useCallback(() => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("renew-ssl-certificates");
  }, []);

  const handleUrlChange = async () => {
    const isValidUrl = (urlString) => {
      try {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (!urlInput || !urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(urlInput.trim())) {
      toast.error("Please enter a valid HTTP or HTTPS URL");
      return;
    }

    setUrlSubmitLoading(true);
    try {
      const response = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("change-webapp-url", {
        url: urlInput.trim(),
      });

      if (response.success) {
        toast.success("Web app URL changed successfully. Window will recreate.");
        setUrlInput("");
      } else {
        toast.error(response.error || "Failed to change URL");
      }
    } catch (error) {
      toast.error("Failed to change URL: " + error.message);
    } finally {
      setUrlSubmitLoading(false);
    }
  };

  // add loader
  return appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
    <div className="desktop-settings-container">
      <div className="desktop-settings-wrapper">
        <div className="settings-header header">🖥️ Desktop Settings</div>
        <p className="text-gray text-sm settings-caption">Following are desktop preference settings</p>

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
                <label className="caption text-bold desktop-setting-port-input-label">Set default proxy port</label>
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
                  <Button className="desktop-port-update-btn" onClick={trackProxyPortChangeRequested}>
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
                    https://requestly.com/desktop
                  </Button>
                }
              />
            </Row>
          )}
        </div>

        {/* Custom Web App URL Section */}
        <div className="mt-16">
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
              <label className="caption text-bold desktop-setting-port-input-label">Change Web App URL</label>
              <Input
                value={urlInput}
                disabled={urlSubmitLoading}
                placeholder="e.g., http://localhost:5000"
                className="desktop-setting-port-input"
                onChange={(e) => setUrlInput(e.target.value)}
              />

              <Popconfirm
                okText="Continue"
                cancelText="No"
                placement="topLeft"
                title="The app window will recreate with the new URL. Changes will not persist after app restart. Continue?"
                onConfirm={handleUrlChange}
              >
                <Button className="desktop-port-update-btn" loading={urlSubmitLoading} disabled={!urlInput.trim()}>
                  Update URL
                </Button>
              </Popconfirm>
              <p className="text-gray text-xs mt-8">Note: URL will revert to default on app restart</p>
            </Col>
          </Row>
        </div>

        {isFeatureCompatible(FEATURES.REGENERATE_SSL_CERTS) ? (
          <>
            <Row align="middle" className="w-full mt-16 setting-item-container">
              <Col span={22}>
                <div className="title">Regenerate SSL Certificate</div>
                <p className="setting-item-caption">
                  If you face certificate trust issues, regenerating the proxy certificates will reset the trust
                  settings in your certificate store.
                </p>
              </Col>
              <Col span={2}>
                <Tooltip title="The app needs to be relaunched after this">
                  <RQButton type="default" onClick={regenerateRootCa}>
                    {" "}
                    Regenerate{" "}
                  </RQButton>
                </Tooltip>
              </Col>
            </Row>
          </>
        ) : null}
        <LocalLogFile />
      </div>
    </div>
  ) : null;
};
