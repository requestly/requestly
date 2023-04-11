import { Alert, Modal, Row, Select, Steps } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "utils/RedirectionUtils";

import CompleteStep from "../common/Complete";
import TestProxyInstructions from "../common/TestProxy";
import CertificateDownloadInstructions from "./CertificateDownload";
import CertificateTrustInstructions from "./CertificateTrust";
import { IOS_DEVICES } from "./constants";
import WifiInstructions from "./Wifi";

const { Option } = Select;

const IOSInstructionModal = ({ isVisible, handleCancel }) => {
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };

  const [selectedDevice, setSelectedDevice] = useState(IOS_DEVICES.IPHONE13_PRO);

  const handleOnDeviceChange = (value) => {
    setSelectedDevice(value);
  };

  const renderDeviceSelector = () => {
    return (
      <Select defaultValue={selectedDevice} style={{ width: 120 }} onChange={handleOnDeviceChange}>
        {Object.keys(IOS_DEVICES).map((device_id) => {
          return <Option value={device_id}>{device_id.toUpperCase()}</Option>;
        })}
      </Select>
    );
  };

  return (
    <>
      <Row className="white header text-bold">IOS Setup Steps&nbsp;&nbsp;&nbsp;{renderDeviceSelector()}</Row>
      <Row className="mt-8">
        <Alert
          message="Steps may vary depending upon your device. Select your device first."
          type="info"
          showIcon
          closable
        />
        <br />
        <Steps direction="vertical" current={1} className="mt-8">
          <Steps.Step
            key={1}
            title="Configure Wifi Proxy"
            status="process"
            description={<WifiInstructions device_id={selectedDevice} />}
          />
          <Steps.Step key={2} title="Test HTTP Proxy" status="process" description={<TestProxyInstructions />} />
          <Steps.Step
            key={3}
            title="Download certificate"
            status="process"
            description={<CertificateDownloadInstructions device_id={selectedDevice} />}
          />
          <Steps.Step
            key={4}
            title="Install and Trust Certificate"
            status="process"
            description={<CertificateTrustInstructions device_id={selectedDevice} />}
          />
          <Steps.Step key={5} title="All Set to go" status="process" description={<CompleteStep appId="ios" />} />
        </Steps>
      </Row>
    </>
  );
};

export default IOSInstructionModal;
