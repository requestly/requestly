import { Col, Image, List, Row } from "antd";

import { IOS_DEVICES } from "./constants";

const CertificateTrustInstructions = ({ device_id }) => {
  const renderGif = () => {
    if (device_id === IOS_DEVICES.IPHONE13_PRO) {
      return <Image src={"/assets/media/components/install-and-trust-ios-profile.gif"} />;
    }
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title="a. Open Downloaded profile"
                description={
                  <>
                    Open settings. You should see a new <code>Profile Downloaded</code> option at the top. Select that
                    to configure the profile
                  </>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={<>b. Install Profile (Password Required)</>}
                description={<>Press Install on the top right a few times and then click Done</>}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={<>c. Trust the installed Certificates</>}
                description={
                  <>
                    Navigate to:{" "}
                    <b>
                      <code>{`Settings -> General -> About -> Certificate Trust Settings`}</code>
                    </b>
                    <br />
                    <code>
                      Toggle the switch for <b>RQProxyCA</b> under <b>Enable Full Trust for Root Certificates</b>
                    </code>
                  </>
                }
              />
            </List.Item>
          </List>
        </Col>
        <Col span={2}></Col>
        <Col span={5}>{renderGif()}</Col>
      </Row>
    </div>
  );
};

export default CertificateTrustInstructions;
