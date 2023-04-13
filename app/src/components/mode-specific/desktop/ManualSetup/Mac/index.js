import React from "react";
import { Row, Col, Card, Typography, Button } from "antd";
import { CardBody } from "reactstrap";
import InstructionsHeader from "../../MySources/Sources/InstructionsModal/InstructionsHeader";
// UTILS
import { getDesktopSpecificDetails } from "../../../../../store/selectors";
// ACTIONS
import { saveRootCert } from "../../../../../actions/DesktopActions";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useSelector } from "react-redux";

const { Title } = Typography;

const MacProxySettings = ({ setShowInstructions }) => {
  //Global State
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const { isBackgroundProcessActive, isProxyServerRunning, proxyPort } = desktopSpecificDetails;

  if (!isBackgroundProcessActive || !isProxyServerRunning) {
    return (
      <React.Fragment>
        <Row>
          <Col>
            <Card className="shadow">
              <CardBody>
                <Jumbotron style={{ background: "transparent" }} className="text-center">
                  <p>Proxy server is not running. Please restart the app or report to us if issue persists.</p>
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
      <InstructionsHeader
        icon={window.location.origin + "/assets/img/thirdPartyAppIcons/package.png"}
        heading="Setting up system proxy"
        description="Requestly requires your applications to send their network traffic through its local proxy server before
            going to the destination."
        setShowInstructions={setShowInstructions}
      />
      <Row className="mt-16">
        <p>
          The proxy server you set globally will be used by Safari, Google Chrome, and other applications that respect
          your system proxy settings. Some applications, including Mozilla Firefox, can have their own custom proxy
          settings independent from your system settings.
        </p>
      </Row>
      <Row>
        <Col>
          <Title level={5}>
            Set your proxy settings to host 127.0.0.1 and port {proxyPort} (http://127.0.0.1:{proxyPort})
          </Title>
          <p>Make sure to set HTTPS proxy, if you want to intercept secure traffic.</p>
        </Col>
      </Row>
      <Row justify="start" align={"middle"}>
        <Button className="text-bold mr-8 self-end" type="primary" onClick={() => saveRootCert()}>
          Save Certificate
        </Button>
      </Row>
    </React.Fragment>
  );
};

export default MacProxySettings;
