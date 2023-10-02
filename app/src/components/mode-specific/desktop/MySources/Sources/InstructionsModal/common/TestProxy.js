import { List, Row, Col, Image } from "antd";
import proxySuccessImage from "assets/img/screenshots/proxy_success.png";
import proxyFailureImage from "assets/img/screenshots/proxy_failure.png";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

const TestProxyInstructions = ({ device }) => {
  return (
    <>
      <List itemLayout="horizontal">
        <List.Item>
          <List.Item.Meta
            title={
              device === "android"
                ? "a. Open Incognito on browser in your Android device"
                : "a. Open Incognito on safari in your IOS device"
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title={
              <>
                b. Go to <a href="http://amiusing.requestly.io">http://amiusing.requestly.io</a>
                &nbsp;
                <span style={{ color: "red" }}>(Use http here. Not https)</span>
              </>
            }
            description={
              <>
                If proxy is applied, then the page should show <b>SUCCESS</b>
              </>
            }
          />
        </List.Item>
      </List>
      <Row>
        <Col span={10} style={{ textAlign: "center" }}>
          <Image src={proxySuccessImage} />
          <br />
          <CheckCircleTwoTone twoToneColor="#52c41a" /> Correct
        </Col>
        <Col span={2}></Col>
        <Col span={10} style={{ textAlign: "center" }}>
          <Image src={proxyFailureImage} />
          <br />
          <CloseCircleTwoTone twoToneColor="#FF0000" /> Wrong
        </Col>
      </Row>
    </>
  );
};

export default TestProxyInstructions;
