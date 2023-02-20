import { Col, Image, List, Row } from "antd";

import oneplus_certs_install_gif from "assets/img/screenshots/android/oneplus/certs_install.gif";
import { ANDROID_DEVICES } from "./constants";

const CertificateTrustInstructions = ({ device_id }) => {
  const renderGif = () => {
    if (device_id === ANDROID_DEVICES.ONEPLUS) {
      return <Image src={oneplus_certs_install_gif} />;
    }
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title="a. Open Trusted Certificate Settings"
                description={
                  <code>
                    {`Settings -> Security -> Encryption & Credentials -> Install
                    a Certificate -> CA Certificate`}
                  </code>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={<>b. Install Certificate (Password Required)</>}
                description={
                  <>
                    Press Install Anyway and Select the certificate
                    (RQProxyCA.pem.cert) downloaded in step 3
                  </>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={<>c. Verify Certs</>}
                description={
                  <>
                    Go to <code>{`Trusted Credentials -> User`}</code>
                    <br />
                    RQProxyCA should be present here
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
