import React, { useState, useEffect } from "react";
import { Row, Space, Typography } from "antd";
import { Alert } from "antd";
import UAParser from "ua-parser-js";
import { supportedBrowserExtensions } from "./supportedBrowserExtensions";
import LINKS from "config/constants/sub/links";
import APP_CONSTANTS from "../../../config/constants";
import { InstallExtensionContent } from "./type";
import {
  trackViewAllPlatformsClicked,
  trackExtensionInstallationButtonClicked,
} from "modules/analytics/events/common/onboarding/index";
import "./installExtensionCTA.css";

const HEADING = "Install Browser extension to start modifying network requests";
const SUBHEADING =
  "Requestly lets developers Modify Headers, Redirect URLs, Switch Hosts, Delay Network requests easily. Private and secure, works locally on your browser.";

const InstallExtensionCTA: React.FC<InstallExtensionContent> = ({
  eventPage,
  supportedBrowsers = null,
  isUpdateRequired = false,
  heading = HEADING,
  subHeading = SUBHEADING,
}) => {
  const [isReloadPagePromptVisible, setIsReloadPagePromptVisible] = useState(false);
  const [browser, setBrowser] = useState<
    { downloadURL: string; name: string; iconURL: string; alt: string } | undefined
  >();

  useEffect(() => {
    const parser = new UAParser();
    parser.setUA(window.navigator.userAgent);
    const result = parser.getResult();
    const browserDetected = result.browser.name;
    let currentBrowserData;

    supportedBrowserExtensions.forEach((extensionData) => {
      // @ts-ignore
      if (!supportedBrowsers || supportedBrowsers.includes(extensionData.name)) {
        if (extensionData.name === browserDetected) {
          currentBrowserData = extensionData;
        }
      }
    });

    setBrowser(currentBrowserData);
  }, [supportedBrowsers]);

  const handleDownloadExtensionClick = () => {
    setIsReloadPagePromptVisible(true);
    trackExtensionInstallationButtonClicked(eventPage);
  };

  return (
    <div className="install-extension-container">
      {heading ? <h1 className="heading">{heading}</h1> : null}

      {subHeading ? <p className="sub-heading">{subHeading}</p> : null}

      {browser ? (
        <a
          rel="noreferrer"
          target="_blank"
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
        <h4 className="browser-not-supported-msg">Current Browser is not supported</h4>
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

      {isReloadPagePromptVisible && (
        <p style={{ marginTop: "20px" }}>
          <Typography.Text keyboard>
            NOTE: After installation, please reload this page to use the feature.
          </Typography.Text>
        </p>
      )}

      {browser && !isUpdateRequired ? (
        <Row style={{ textAlign: "center" }}>
          <Alert
            message={
              <p style={{ marginBottom: "0px" }}>
                Already installed the extension and still seeing this message? Read our{" "}
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="troubleshooting-guide-link"
                  href={APP_CONSTANTS.LINKS.REQUESTLY_EXTENSION_TROUBLESHOOTING}
                >
                  Troubleshooting guide
                </a>
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
