import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import ProCard from "@ant-design/pro-card";
import { Button, Space, Typography, Row, Col, Alert } from "antd";
import DeviceSelector from "./components/DeviceIdSelector";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";
import { useEffect } from "react";
import Logger from "./components/Logger";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  trackDeviceIdSelectedEvent,
  trackDeviceIdSelectedFailureEvent,
} from "modules/analytics/events/features/mobileDebugger";
import { getMobileDebuggerAppDetails, getMobileDebuggerInterceptorDetails } from "store/selectors";
import { actions } from "store";

const { Title } = Typography;

const InterceptorUI = ({ appId }) => {
  // GLOBAL STATE
  const dispatch = useDispatch();
  const mobileDebuggerAppDetails = useSelector(getMobileDebuggerAppDetails);
  const mobileDebuggerInterceptorDetails = useSelector(getMobileDebuggerInterceptorDetails);

  // LOCAL
  const [sdkId, setSdkId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceIdInput, setDeviceIdInput] = useState(deviceId);

  const [isDeviceSelectorVisible, setIsDeviceSelectorVisible] = useState(false);
  const [showLogger, setShowLogger] = useState(false);

  const saveUserDeviceSelectionInStore = () => {
    dispatch(actions.updateMobileDebuggerInterceptorDetails({ deviceId }));
  };

  const attachUserRulesToDevice = (sdkId, deviceId) => {
    let functions = getFunctions();
    const createUserDeviceMapping = httpsCallable(functions, "createUserDeviceMapping");
    createUserDeviceMapping({
      sdkId,
      deviceId,
    })
      .then((res) => {
        let response = res.data;
        if (response && !response.status) {
          toast.error("Could not attach your rules to device");
          trackDeviceIdSelectedFailureEvent();
          return;
        }
        trackDeviceIdSelectedEvent();
      })
      .catch((err) => {
        toast.error(err);
        trackDeviceIdSelectedFailureEvent();
      });
  };

  const handleInterceptorParamSelection = () => {
    if (!sdkId) {
      toast.error("Please select an sdkId to connect");
      return;
    }

    if (!deviceIdInput) {
      toast.error("Please specify a deviceId");
      return;
    }

    if (deviceId !== deviceIdInput) {
      setDeviceId(deviceIdInput);
    }

    saveUserDeviceSelectionInStore();
    attachUserRulesToDevice(sdkId, deviceId);
    setShowLogger(true);
    setIsDeviceSelectorVisible(false);
  };

  useEffect(() => {
    setSdkId(mobileDebuggerAppDetails["id"]);
    setDeviceId(mobileDebuggerInterceptorDetails["deviceId"]);
    setDeviceIdInput(mobileDebuggerInterceptorDetails["deviceId"]);

    if (!mobileDebuggerInterceptorDetails["deviceId"]) {
      setIsDeviceSelectorVisible(true);
    } else {
      attachUserRulesToDevice(sdkId, deviceId);
      setShowLogger(true);
      setIsDeviceSelectorVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileDebuggerAppDetails, mobileDebuggerInterceptorDetails]);

  return (
    <>
      <Modal
        open={isDeviceSelectorVisible}
        onCancel={() => setIsDeviceSelectorVisible(false)}
        onOk={handleInterceptorParamSelection}
        okText="Intercept"
        width={800}
        closable={false}
        bodyStyle={{ padding: 32 }}
        title="Configure Interceptor"
      >
        <Alert
          style={{
            marginLeft: "24px",
            marginBottom: "16px",
            marginRight: "24px",
            padding: "4px 8px 4px 8px",
          }}
          message={
            <>
              <a target="_blank" rel="noreferrer" href="https://docs.requestly.io/android-debugger/tutorial">
                Click Here{" "}
              </a>{" "}
              to learn more about how Android Interceptor Works.
            </>
          }
          type="info"
          showIcon
          closable
        />
        {/* <Row style={{ paddingBottom: 16 }}>
          <Col span={24}>
            <SdkSelector sdkId={sdkId} setSelectedSdkId={setSdkId} />
          </Col>
        </Row> */}
        <Row>
          <Col span={24}>
            <DeviceSelector
              sdkId={sdkId}
              deviceId={deviceIdInput}
              setSelectedDeviceId={setDeviceId}
              updateDeviceIdInput={setDeviceIdInput}
            />
          </Col>
        </Row>
      </Modal>
      {showLogger ? (
        <>
          <Logger sdkId={sdkId} deviceId={deviceId} showDeviceSelector={() => setIsDeviceSelectorVisible(true)} />
        </>
      ) : (
        <>
          <ProCard className="primary-card github-like-border">
            <Row style={{ textAlign: "center" }} align="center">
              <Col span={24}>
                <Jumbotron style={{ background: "transparent" }} className="text-center">
                  <Title level={4}>Connect Device to intercept & modify requests</Title>
                  <Space>
                    <Button type="primary" size="small" onClick={() => setIsDeviceSelectorVisible(true)}>
                      Select Device
                    </Button>
                    <Button
                      type="default"
                      size="small"
                      target="_blank"
                      href="https://docs.requestly.io/android-debugger/api-debugger/view-network-traffic-on-web"
                      icon={<InfoCircleOutlined />}
                    >
                      Learn More
                    </Button>
                  </Space>
                </Jumbotron>
              </Col>
            </Row>
          </ProCard>
        </>
      )}
    </>
  );
};

export default InterceptorUI;
