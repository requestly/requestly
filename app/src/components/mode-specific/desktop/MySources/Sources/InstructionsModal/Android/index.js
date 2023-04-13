import { Dropdown, Row, Steps } from "antd";
import { useState } from "react";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import CompleteStep from "../common/Complete";
import TestProxyInstructions from "../common/TestProxy";
import CertificateDownloadInstructions from "./CertificateDownload";
import CertificateTrustInstructions from "./CertificateTrust";
import { ANDROID_DEVICES } from "./constants";
import WifiInstructions from "./Wifi";
import InstructionsHeader from "../InstructionsHeader";

const AndroidInstructionModal = ({ setShowInstructions }) => {
  const [selectedDevice, setSelectedDevice] = useState(ANDROID_DEVICES.ONEPLUS);

  const handleOnDeviceChange = (value) => {
    setSelectedDevice(value);
  };

  const renderDeviceSelector = () => {
    const menuItems = Object.keys(ANDROID_DEVICES).map((device_id) => {
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
        icon={window.location.origin + "/assets/img/thirdPartyAppIcons/android.png"}
        heading="Android setup"
        description="Note: Follow the below mentioned steps to complete the setup. Steps may vary depending upon your device. Select your device first."
        setShowInstructions={setShowInstructions}
        RightComponent={renderDeviceSelector()}
      />
      <Row className="mt-8 setup-instructions-body">
        <Steps direction="vertical" current={1} className="mt-8">
          <Steps.Step
            title="Configure Wifi Proxy"
            status="process"
            description={<WifiInstructions device_id={selectedDevice} />}
          />
          <Steps.Step title="Test HTTP Proxy" status="process" description={<TestProxyInstructions />} />
          <Steps.Step title="Download certificate" status="process" description={<CertificateDownloadInstructions />} />
          <Steps.Step
            title="Trust Certificate"
            status="process"
            description={<CertificateTrustInstructions device_id={selectedDevice} />}
          />
          <Steps.Step title="All Set to go" status="process" description={<CompleteStep appId="android" />} />
        </Steps>
      </Row>
    </>
  );
};

export default AndroidInstructionModal;
