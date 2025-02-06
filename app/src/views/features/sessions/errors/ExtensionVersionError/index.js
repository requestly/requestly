import React from "react";
import { useSelector } from "react-redux";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Row } from "antd";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { getAppTheme } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { redirectToDownloadPage } from "utils/RedirectionUtils";

const ExtensionVersionError = () => {
  //GLOBAL STATE
  const appTheme = useSelector(getAppTheme);

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row className="hp-text-center">
          <Col span={24}>
            <Row justify="center">
              <Col>
                <img
                  className="hp-position-relative hp-d-block hp-m-auto"
                  src={
                    appTheme === APP_CONSTANTS.THEMES.DARK
                      ? "/assets/media/views/modular-coding-dark.svg"
                      : "/assets/media/views/modular-coding.svg"
                  }
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
              <h1 className="display-3">Update Required</h1>
              <p className="lead">
                Your extension version needs to be higher to use SessionBook. Please download the latest version from
                official website.
              </p>
              <center>
                <Button type="primary" onClick={redirectToDownloadPage}>
                  Get latest extension
                </Button>
              </center>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default ExtensionVersionError;
