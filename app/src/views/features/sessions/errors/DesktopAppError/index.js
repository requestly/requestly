import React from "react";
import { useSelector } from "react-redux";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Row, Space } from "antd";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { getAppTheme } from "store/selectors";
import img from "../../../../../assets/images/illustrations/modular-coding.svg";
import imgDark from "../../../../../assets/images/illustrations/modular-coding-dark.svg";
import APP_CONSTANTS from "config/constants";
import { redirectToDownloadPage } from "utils/RedirectionUtils";

const DesktopAppError = () => {
  //Global State
  const appTheme = useSelector(getAppTheme);

  return (
    <ProCard className="primary-card github-like-border">
      <Row className="hp-text-center">
        <Col span={24}>
          <Row justify="center">
            <Col>
              <img
                className="hp-position-relative hp-d-block hp-m-auto"
                src={appTheme === APP_CONSTANTS.THEMES.DARK ? imgDark : img}
                alt="403"
                style={{ maxHeight: "30vh" }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ textAlign: "center" }} align="center">
        <Col span={24}>
          <Jumbotron style={{ background: "transparent" }} className="text-center">
            <h1 className="display-3">Session Replay is available with browser extension only.</h1>
            <p className="lead">
              Record activity on a webpage and replay details like console logs and network requests stitched together
            </p>

            <Space>
              <Button type="primary" onClick={redirectToDownloadPage}>
                Get Extension
              </Button>
            </Space>
          </Jumbotron>
        </Col>
      </Row>
    </ProCard>
  );
};

export default DesktopAppError;
