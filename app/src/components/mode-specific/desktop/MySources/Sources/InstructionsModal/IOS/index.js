import { Dropdown, Row, Steps } from "antd";
import { useState } from "react";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import CompleteStep from "../common/Complete";
import TestProxyInstructions from "../common/TestProxy";
import CertificateDownloadInstructions from "./CertificateDownload";
import CertificateTrustInstructions from "./CertificateTrust";
import { IOS_DEVICES } from "./constants";
import WifiInstructions from "./Wifi";
import InstructionsHeader from "../InstructionsHeader";

const IOSInstructionModal = ({ setShowInstructions }) => {
  const [selectedDevice, setSelectedDevice] = useState(IOS_DEVICES.IPHONE13_PRO);

  const handleOnDeviceChange = (value) => {
    setSelectedDevice(value);
  };

  const renderDeviceSelector = () => {
    const menuItems = Object.keys(IOS_DEVICES).map((device_id) => {
      return {
        key: device_id,
        label: device_id.toUpperCase(),
      };
    });

    const menuProp = {
      items: menuItems,
      onClick: (item) => handleOnDeviceChange(item.key),
    };

    return (
      <Dropdown.Button icon={<DownArrow />} menu={menuProp}>
        {selectedDevice}
      </Dropdown.Button>
    );
  };

  return (
    <>
      <InstructionsHeader
        icon={window.location.origin + "/assets/img/thirdPartyAppIcons/ios.svg"}
        heading="iOS setup"
        description="Note: Follow the below mentioned steps to complete the setup. Steps may vary depending upon your device. Select your device first."
        setShowInstructions={setShowInstructions}
        RightComponent={renderDeviceSelector()}
      />
      <Row className="mt-8 setup-instructions-body">
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
