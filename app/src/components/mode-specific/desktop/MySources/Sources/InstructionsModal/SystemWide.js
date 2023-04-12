import { Modal, Row, Steps } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "utils/RedirectionUtils";
import CertsInstructions from "./common/Certs";
import CompleteStep from "./common/Complete";
import ProxyInstructions from "./common/Proxy";

const SystemWideInstructionModal = ({ isVisible, handleCancel }) => {
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };
  return (
    <>
      <Row className="white header text-bold">Steps to setup System Wide Proxy</Row>
      <Row className="mt-8">
        <Steps direction="vertical" current={1}>
          <Steps.Step title="Install & Trust Certs" status="process" description={<CertsInstructions />} />
          <Steps.Step title="Setup Proxy" status="process" description={<ProxyInstructions />} />
          <Steps.Step title="All Set to go" status="process" description={<CompleteStep appId={"system-wide"} />} />
        </Steps>
      </Row>
    </>
  );
};

export default SystemWideInstructionModal;
