import React from "react";
import { Row, Col, Card, Typography, Steps, List, Image } from "antd";
import { CardBody } from "reactstrap";
import UAParser from "ua-parser-js";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useSelector } from "react-redux";
import { RQButton } from "lib/design-system/components";
import { getDesktopSpecificDetails } from "store/selectors";
import InstructionsHeader from "../MySources/Sources/InstructionsModal/InstructionsHeader";
import { saveRootCert } from "actions/DesktopActions";

const { Text } = Typography;

const windowsInstructions = [
  {
    title: (
      <Text>
        2. Open start menu and search for <b>Manage user certificates</b>
      </Text>
    ),
  },
  {
    title: (
      <Text>
        3. Open <b>Trusted Root Certification Authorities</b> from the left panel
      </Text>
    ),
  },
  {
    title: (
      <Text>
        4. Right click on <b>Certificates</b>
      </Text>
    ),
  },
  {
    title: (
      <Text>
        5. Click on <b>Certificates &gt; import ...</b>
      </Text>
    ),
  },
  {
    title: <Text>6. Import the certificate you downloaded in the previous step (RQProxyCA.pem)</Text>,
  },
];

const macInstructions = [
  {
    title: <Text>2. To import certificate in Keychain, go to keychain access (press cmd+enter and type keychain)</Text>,
    description: `select “Login” keychain from sidebar -> click on “File” in Mac's top menu bar -> click on “Import items” to select the certificate installed in the first step`,
  },
  {
    title: <Text>3. To mark the certificate as trusted, double click the imported certificate (RQProxyCA.pem)</Text>,
    description: `select “Always Trust” for “When Using the certificate” in the trust section`,
  },
];

const ManualProxySetup = ({ setShowInstructions }) => {
  //Global State
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const ua = new UAParser(window.navigator.userAgent);
  const os = ua.getOS();

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

  const renderOsxInstructions = () => {
    return (
      <>
        {macInstructions.map((step) => {
          return <List.Item.Meta title={step.title} description={step.description} />;
        })}
        <Image src={"/assets/media/components/trust_cert.gif"} />
      </>
    );
  };

  const renderWindowsInstructions = () => {
    return (
      <>
        {windowsInstructions.map((step) => {
          return <List.Item.Meta title={step.title} />;
        })}
        <Image src={"/assets/media/components/install_win_cert.gif"} />
      </>
    );
  };

  return (
    <>
      <InstructionsHeader
        icon={window.location.origin + "/assets/media/components/package.png"}
        heading="Setting up system proxy"
        description="Requestly requires your applications to send their network traffic through its local proxy server before
            going to the destination."
        setShowInstructions={setShowInstructions}
      />
      <Row className="mt-16 setup-instructions-body" gutter={20}>
        <Col>
          <Text>
            The proxy server you set globally will be used by Safari, Google Chrome, and other applications that respect
            your system proxy settings. Some applications, including Mozilla Firefox, can have their own custom proxy
            settings independent from your system settings.
          </Text>
        </Col>
        <Steps direction="vertical" current={1} className="mt-8">
          <Steps.Step
            title="Configure Proxy"
            status="process"
            description={
              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    title={`Set your proxy settings to host 127.0.0.1 and port ${proxyPort} (http://127.0.0.1:${proxyPort})`}
                    description="Make sure to set HTTPS proxy, if you want to intercept secure traffic."
                  />
                </List.Item>
              </List>
            }
          />
          <Steps.Step
            title="Install and Trust Certificate"
            status="process"
            description={
              <List itemLayout="horizontal" className="mt-16">
                <List.Item.Meta
                  title={
                    <>
                      <Text>1. </Text>
                      <RQButton size="small" type="default" onClick={saveRootCert}>
                        Save Certificate
                      </RQButton>
                    </>
                  }
                />
                {os.name === "Mac OS" ? renderOsxInstructions() : renderWindowsInstructions()}
              </List>
            }
          />
        </Steps>
      </Row>
    </>
  );
};

export default ManualProxySetup;
