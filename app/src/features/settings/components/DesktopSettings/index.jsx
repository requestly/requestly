import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Alert, Button, Col, Input, Popconfirm, Row, Tooltip } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { LinkOutlined } from "@ant-design/icons";
import { RQInput } from "lib/design-system/components";
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
  const isCustomUrlEnabled = useFeatureIsOn("allow_desktop_beta_preview_url_configuration");

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
    const trimmedUrl = urlInput.trim();

    const isValidUrl = (urlString) => {
      try {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };

    const containsRequiredKeywords = (urlString) => {
      const lowerUrl = urlString.toLowerCase();
      const allowedKeywords = ["beta", "web.app"];
      return allowedKeywords.some((keyword) => lowerUrl.includes(keyword));
    };

    if (!trimmedUrl) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      toast.error("Please enter a valid HTTP or HTTPS URL");
      return;
    }

    if (!containsRequiredKeywords(trimmedUrl)) {
      toast.error("URL must contain one of the allowed keywords");
      return;
    }

    setUrlSubmitLoading(true);
    try {
      const response = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("change-webapp-url", {
        url: trimmedUrl,
      });

      if (response?.success) {
        toast.success("Web app URL changed successfully. Window will recreate.");
        setUrlInput("");
      } else {
        toast.error(response?.error || "Failed to change URL");
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
            <Row align="middle" className="w-full setting-item-container">
              <Col span={22}>
                <div className="title">Set default proxy port</div>
                <p className="setting-item-caption">
                  Change the default port for the proxy server. Browsers launched from Requestly will be closed.
                </p>
                <Row style={{ marginTop: "16px" }}>
                  <Col span={18}>
                    <Input
                      value={portInput}
                      disabled={portSubmitLoading}
                      placeholder="Enter New Port"
                      className="desktop-setting-port-input"
                      onChange={(e) => setPortInput(e.target.value)}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={2} style={{ alignSelf: "flex-end" }}>
                <Popconfirm
                  okText="Continue"
                  cancelText="No"
                  placement="topLeft"
                  title="Browsers launched from Requestly will be closed. Do you want to proceed?"
                  onConfirm={handlePortChange}
                  onCancel={trackUserDeniedClosingLaunchedApps}
                >
                  <RQButton onClick={trackProxyPortChangeRequested} type="default">
                    Update
                  </RQButton>
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

        {isCustomUrlEnabled && (
          <div className="preview-url-container">
            <Row align="middle" className="w-full mt-16 setting-item">
              <Col span={24}>
                <div className="title">Change Web App URL</div>
                <p className="setting-item-caption">
                  Temporarily change the web app URL for testing. Changes won't persist after app restart.
                </p>
                <Row className="header-row">
                  <Col span={21}>
                    <RQInput
                      placeholder="Enter new URL"
                      onChange={(e) => setUrlInput(e.target.value)}
                      value={urlInput}
                    />
                  </Col>
                  <Col span={2}>
                    <Popconfirm
                      okText="Continue"
                      cancelText="No"
                      placement="topLeft"
                      title="Window will recreate with new URL. Changes won't persist after restart. Continue?"
                      onConfirm={handleUrlChange}
                    >
                      <RQButton
                        className="update-url-btn"
                        loading={urlSubmitLoading}
                        disabled={!urlInput.trim() || urlSubmitLoading}
                        type="default"
                      >
                        Update
                      </RQButton>
                    </Popconfirm>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        )}

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
