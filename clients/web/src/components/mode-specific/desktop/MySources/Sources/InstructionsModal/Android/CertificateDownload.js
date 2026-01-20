import { Col, List, Row } from "antd";

const CertificateDownloadInstructions = ({ device_id }) => {
  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta title="a. Open Incognito window in your browser" />
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
                    This will download <b>RQProxyCA.pem.cert</b>
                  </>
                }
              />
            </List.Item>
          </List>
        </Col>
      </Row>
    </div>
  );
};

export default CertificateDownloadInstructions;
