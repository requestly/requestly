import React from "react";
import { Row, Col, Card, Typography, Button } from "antd";
import { CardBody } from "reactstrap";
// UTILS
import { getDesktopSpecificDetails } from "../../../../../store/selectors";
// ACTIONS
import { saveRootCert } from "../../../../../actions/DesktopActions";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useSelector } from "react-redux";

const { Title } = Typography;

const MacProxySettings = () => {
  //Global State
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const {
    isBackgroundProcessActive,
    isProxyServerRunning,
    proxyPort,
  } = desktopSpecificDetails;

  if (!isBackgroundProcessActive || !isProxyServerRunning) {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <Card className="shadow">
              <CardBody>
                <Jumbotron
                  style={{ background: "transparent" }}
                  className="text-center"
                >
                  <p>
                    Proxy server is not running. Please restart the app or
                    report to us if issue persists.
                  </p>
                </Jumbotron>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Row>
        <Col lg="12" style={{ textAlign: "center", width: "100%" }}>
          <Title level={2}>Setting up system proxy</Title>
        </Col>
      </Row>
      <Row>
        <Col>
          <Title level={5}>
            Requestly requires your applications to send their network traffic
            through the its local proxy server before going to their
            destination.
          </Title>
          <p>
            The proxy server you set globally will be used by Safari, Google
            Chrome, and other applications that respect your system proxy
            settings. Some applications, including Mozilla Firefox, can have
            their own custom proxy settings independent from your system
            settings.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Title level={5}>
            Set your proxy settings to host 127.0.0.1 and port {proxyPort}{" "}
            (http://127.0.0.1:{proxyPort})
          </Title>
          <p>
            Make sure to set HTTPS proxy, if you want to intercept secure
            traffic.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          {/* <Paragraph className="text-center">
            Click{" "}
            <Text type="link" onClick={() => saveRootCert()}>
              here
            </Text>{" "}
            to save certificate to your disk.
          </Paragraph> */}
          <Button type="primary" onClick={() => saveRootCert()}>
            Save Certificate
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default MacProxySettings;
