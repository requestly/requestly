import { Row, Steps } from "antd";
import React from "react";
import CertsInstructions from "./common/Certs";
import ProxyInstructions from "./common/Proxy";

const SystemWideInstructionModal = () => {
  return (
    <>
      <Row className="white header text-bold">Steps to setup System Wide Proxy</Row>
      <Row className="mt-8">
        <Steps direction="vertical" current={1}>
          <Steps.Step title="Install & Trust Certs" status="process" description={<CertsInstructions />} />
          <Steps.Step title="Setup Proxy" status="process" description={<ProxyInstructions />} />
        </Steps>
      </Row>
    </>
  );
};

export default SystemWideInstructionModal;
