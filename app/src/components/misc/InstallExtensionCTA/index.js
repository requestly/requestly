import React, { useState, useEffect } from "react";
import { Row, Col, Button, Space, Typography, Divider } from "antd";
import ProCard from "@ant-design/pro-card";
import { Alert } from "antd";
import UAParser from "ua-parser-js";
import { supportedBrowserExtensions } from "./supportedBrowserExtensions";
import { trackExtensionInstallationButtonClicked } from "modules/analytics/events/common/onboarding/index";

// import { Link } from "react-router-dom";
//CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useNavigate } from "react-router-dom";

const { Link: AntLink, Text } = Typography;
const { PATHS } = APP_CONSTANTS;

const InstallExtensionCTA = ({
  heading,
  subHeadingExtension,
  subHeadingMobileDebugger = "Debug Mobile App API Traffic",
  supportsMobileDevice = false,
  supportedBrowsers = null,
  eventPage,
  hasBorder = true,
  isUpdateRequired = false,
}) => {
  const navigate = useNavigate();

  const [browser, setBrowser] = useState();
  const [otherBrowsers, setOtherBrowsers] = useState([]);
  const [reloadPage, setReloadPage] = useState(false);

  useEffect(() => {
    const parser = new UAParser();
    parser.setUA(window.navigator.userAgent);
    const result = parser.getResult();
    const browserDetected = result.browser.name;
    let currentBrowserData,
      otherBrowsersArray = [];

    supportedBrowserExtensions.forEach((extensionData) => {
      if (!supportedBrowsers || supportedBrowsers.includes(extensionData.name)) {
        if (extensionData.name === browserDetected) {
          currentBrowserData = extensionData;
        } else {
          otherBrowsersArray.push(extensionData);
        }
      }
    });

    setBrowser(currentBrowserData);
    setOtherBrowsers(otherBrowsersArray);
  }, [supportedBrowsers]);

  const handleDownloadExtensionClick = () => {
    setReloadPage(true);
    trackExtensionInstallationButtonClicked(eventPage);
  };

  return (
    <>
      <ProCard className={`primary-card ${hasBorder ? "github-like-border" : null}`}>
        <h1 className="display-3" style={{ textAlign: "center" }} align="center">
          {heading}
        </h1>
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h2 className="display-3">{subHeadingExtension}</h2>
              {browser ? (
                <a href={browser.downloadURL} target={"_blank"} rel="noreferrer" onClick={handleDownloadExtensionClick}>
                  <Button type="primary" size="large">
                    <Space align="center">
                      <img alt={browser.alt} src={browser.iconURL} height="24" width="24" />
                      <span>
                        {isUpdateRequired ? "Update" : "Install"} {browser.name} extension
                      </span>
                    </Space>
                  </Button>
                </a>
              ) : (
                <h4>Current Browser is not supported</h4>
              )}

              {reloadPage && (
                <p style={{ marginTop: "20px" }}>
                  <Text keyboard>After installation, please reload this page to use the feature.</Text>
                </p>
              )}

              <h4 style={{ marginTop: "8px" }}>
                Also available for browsers:
                {otherBrowsers.map((item, key) => {
                  return (
                    <a key={key} href={item.downloadURL} rel="noreferrer" style={{ paddingLeft: "5px" }}>
                      <img src={item.iconURL} alt={item.alt} height="24" width="24" />
                    </a>
                  );
                })}
              </h4>

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
            </Jumbotron>
          </Col>
          {supportsMobileDevice && (
            <Col span={24}>
              <Jumbotron style={{ background: "transparent" }} className="text-center">
                <Divider style={{ marginBottom: "1em", marginTop: "1em" }}>or</Divider>
                <h2 className="display-3">{subHeadingMobileDebugger}</h2>
                <p className="lead">
                  <AntLink
                    target="_blank"
                    rel="noopener noreferrer"
                    href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_ANDROID_DEBUGGER}
                  >
                    Read Docs
                  </AntLink>
                </p>
                <Space>
                  <Button
                    type="primary"
                    onClick={(e) => {
                      navigate(PATHS.MOBILE_DEBUGGER.ABSOLUTE);
                    }}
                  >
                    Use with Android
                  </Button>
                </Space>
              </Jumbotron>
            </Col>
          )}
        </Row>
      </ProCard>
    </>
  );
};

export default InstallExtensionCTA;
