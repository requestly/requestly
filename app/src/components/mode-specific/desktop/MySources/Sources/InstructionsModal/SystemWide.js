import { Modal, Steps } from "antd";
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
      <Modal
        title="Steps to setup System Wide Proxy"
        visible={isVisible}
        onOk={navigateToTraffic}
        okText="Inspect Traffic"
        onCancel={handleCancel}
        cancelText="Close"
        width="50%"
      >
        <Steps direction="vertical" current={1}>
          <Steps.Step
            title="Install & Trust Certs"
            status="process"
            description={<CertsInstructions />}
          />
          <Steps.Step
            title="Setup Proxy"
            status="process"
            description={<ProxyInstructions />}
          />
          <Steps.Step
            title="All Set to go"
            status="process"
            description={<CompleteStep appId={"system-wide"} />}
          />
        </Steps>
      </Modal>
    </>
  );
};

export default SystemWideInstructionModal;
