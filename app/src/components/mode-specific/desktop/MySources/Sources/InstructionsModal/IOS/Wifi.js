import { useSelector } from "react-redux";
import { Row, Col, Image, List } from "antd";
import { getDesktopSpecificDetails } from "../../../../../../../store/selectors";
import { IOS_DEVICES } from "./constants";

const WifiInstructions = ({ device_id }) => {
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { proxyPort, proxyIp } = desktopSpecificDetails;

  const renderGif = () => {
    if (device_id === IOS_DEVICES.IPHONE13_PRO) {
      return <Image src={"/assets/media/components/configure-ios-proxy.gif"} />;
    }
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title="a. Open Wifi Settings"
                description={
                  <>
                    Navigate to:{" "}
                    <b>
                      <code>{`Settings -> Wi-Fi -> Select current Wi-Fi -> Configure Proxy`}</code>
                    </b>
                  </>
                }
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="b. Set Proxy Settings"
                description={
                  <>
                    Now to set the proxy settings as
                    <br />
                    <code>
                      Proxy: <b>Manual</b>
                    </code>
                    <br />
                    <code>
                      Server: <b>{proxyIp}</b>
                    </code>
                    <br />
                    <code>
                      Port: <b>{proxyPort}</b>
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

export default WifiInstructions;
