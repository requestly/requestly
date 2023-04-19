import { Alert, Row, Steps } from "antd";
import React from "react";
import CertsInstructions from "./common/Certs";
import ProxyInstructions from "./common/Proxy";

const SafariInstructions = () => {
  return (
    <>
      <Row className="white header text-bold">Steps to setup proxy for Safari</Row>
      <Row className="mt-8">
        <Alert
          message="Safari doesn't let you set instance level proxy. For Requestly to work on Safari, you need to place a system wide proxy"
          type="info"
          showIcon
          closable
        />
        <br />
        <Steps direction="vertical" current={1} className="mt-8">
          <Steps.Step title="Install & Trust Certs" status="process" description={<CertsInstructions />} />
          <Steps.Step title="Setup Proxy" status="process" description={<ProxyInstructions />} />
        </Steps>
      </Row>
    </>
  );
};

export default SafariInstructions;
