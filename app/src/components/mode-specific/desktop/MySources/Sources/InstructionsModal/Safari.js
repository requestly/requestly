import { Alert, Modal, Row, Steps } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "utils/RedirectionUtils";
import CertsInstructions from "./common/Certs";
import CompleteStep from "./common/Complete";
import ProxyInstructions from "./common/Proxy";

const SafariInstructionModal = ({ isVisible, handleCancel }) => {
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };
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
          <Steps.Step title="All Set to go" status="process" description={<CompleteStep appId="fresh-safari" />} />
        </Steps>
      </Row>
    </>
  );
};

export default SafariInstructionModal;
