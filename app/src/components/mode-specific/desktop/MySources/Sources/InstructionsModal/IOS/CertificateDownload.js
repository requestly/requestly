import { Col, Image, List, Row } from "antd";
import { IOS_DEVICES } from "./constants";

const CertificateDownloadInstructions = ({ device_id }) => {
  const renderGif = () => {
    if (device_id === IOS_DEVICES.IPHONE13_PRO) {
      return <Image src={"/assets/media/components/download-ios-profile.gif"} />;
    }
  };
  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta title="a. Open Safari on your IPhone" />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={
                  <>
                    b. Go to{" "}
                    <a href="http://requestly.io/ssl" target="__blank">
                      http://requestly.io/ssl
                    </a>{" "}
                    <span style={{ color: "red" }}>(Use http here. Not https)</span>
                  </>
                }
                description={
                  <>
                    This will download <b>RQProxyCA.pem</b>
                  </>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="c. Click on Allow for the prompt shown"
                description={
                  <>
                    This will install a new configuration profile on your device. This will be used to make the device
                    trust the downloaded ssl certificate
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

export default CertificateDownloadInstructions;
