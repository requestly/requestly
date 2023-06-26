import React, { useState, useEffect } from "react";
import { Row, Space, Typography } from "antd";
import { Alert } from "antd";
import UAParser from "ua-parser-js";
import { supportedBrowserExtensions } from "./supportedBrowserExtensions";
import LINKS from "config/constants/sub/links";
import APP_CONSTANTS from "../../../config/constants";
import {
  trackViewAllPlatformsClicked,
  trackExtensionInstallationButtonClicked,
} from "modules/analytics/events/common/onboarding/index";
import "./installExtensionCTA.css";

const { Link: AntLink, Text } = Typography;

const InstallExtensionCTA = ({
  heading,
  eventPage,
  subHeading,
  supportedBrowsers = null,
  isUpdateRequired = false,
}) => {
  const [browser, setBrowser] = useState();
  const [reloadPage, setReloadPage] = useState(false);

  useEffect(() => {
    const parser = new UAParser();
    parser.setUA(window.navigator.userAgent);
    const result = parser.getResult();
    const browserDetected = result.browser.name;
    let currentBrowserData;

    supportedBrowserExtensions.forEach((extensionData) => {
      if (!supportedBrowsers || supportedBrowsers.includes(extensionData.name)) {
        if (extensionData.name === browserDetected) {
          currentBrowserData = extensionData;
        }
      }
    });

    setBrowser(currentBrowserData);
  }, [supportedBrowsers]);

  const handleDownloadExtensionClick = () => {
    setReloadPage(true);
    trackExtensionInstallationButtonClicked(eventPage);
  };

  return (
    <div className="install-extension-container">
      {heading ? <h1 className="heading">{heading}</h1> : null}

      {subHeading ? <p className="sub-heading">{subHeading}</p> : null}

      {browser ? (
        <a
          rel="noreferrer"
          target={"_blank"}
          href={browser.downloadURL}
          className="install-extension-link"
          onClick={handleDownloadExtensionClick}
        >
          <Space size={12} align="center">
            <span>
              {isUpdateRequired ? "Update" : "Install"} {browser.name} extension
            </span>
            <img alt={browser.alt} src={browser.iconURL} height="24" width="24" />
          </Space>
        </a>
      ) : (
        <h4>Current Browser is not supported</h4>
      )}

      <a
        rel="noreferrer"
        target="_blank"
        href={LINKS.REQUESTLY_DOWNLOAD_PAGE}
        className="view-all-platforms-link"
        onClick={() => trackViewAllPlatformsClicked(eventPage, "install_extension")}
      >
        All other platforms/browsers
      </a>

      {reloadPage && (
        <p style={{ marginTop: "20px" }}>
          <Text keyboard>NOTE: After installation, please reload this page to use the feature.</Text>
        </p>
      )}

      {browser && !isUpdateRequired ? (
        <Row style={{ textAlign: "center" }} align="center">
          <Alert
            message={
              <p style={{ marginBottom: "0px" }}>
                Already installed the extension and still seeing this message? Read our{" "}
                <AntLink
                  target="_blank"
                  rel="noopener noreferrer"
                  href={APP_CONSTANTS.LINKS.REQUESTLY_EXTENSION_TROUBLESHOOTING}
                >
                  Troubleshooting guide
                </AntLink>
              </p>
            }
            type="info"
            showIcon
            style={{ marginTop: "1rem" }}
          />
        </Row>
      ) : null}
    </div>
  );
};

export default InstallExtensionCTA;
