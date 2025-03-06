import { Row, Steps } from "antd";
import React from "react";
import CertsInstructions from "./common/Certs";
import ProxyInstructions from "./common/Proxy";
import InstructionsHeader from "./InstructionsHeader";

const SystemWideInstructions = ({ setShowInstructions }) => {
  return (
    <>
      <InstructionsHeader
        icon={window.location.origin + "/assets/media/components/package.png"}
        heading="Setting up system proxy"
        description="Requestly requires your applications to send their network traffic through its local proxy server before
            going to the destination."
        setShowInstructions={setShowInstructions}
      />
      <Row className="mt-16  setup-instructions-body">
        <Steps direction="vertical" current={1}>
          <Steps.Step title="Install & Trust Certs" status="process" description={<CertsInstructions />} />
          <Steps.Step title="Setup Proxy" status="process" description={<ProxyInstructions />} />
        </Steps>
      </Row>
    </>
  );
};

export default SystemWideInstructions;
