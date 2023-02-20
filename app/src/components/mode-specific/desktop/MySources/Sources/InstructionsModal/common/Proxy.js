import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Tabs, Badge, Tag, List, Image } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { getDesktopSpecificDetails } from "../../../../../../../store/selectors";
import proxyStepsGif from "assets/img/screenshots/proxy_steps.gif";
import winProxyStepsGif from "assets/img/screenshots/win_proxy_steps.gif";
import UAParser from "ua-parser-js";
import Logger from "lib/logger";

const { TabPane } = Tabs;

const ProxyInstructions = () => {
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const { proxyPort } = desktopSpecificDetails;
  const [proxyStatus, setProxyStatus] = useState({ http: false, https: false });

  const fetchProxyStatus = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(
      "system-wide-proxy-status",
      {}
    )
      .then((res) => {
        setProxyStatus(res);
      })
      .catch((err) => Logger.log(err));
  };

  useEffect(() => {
    fetchProxyStatus();
  }, [proxyPort]);

  const onClickHandler = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(
      "system-wide-proxy-start",
      {}
    )
      .then((_res) => {
        fetchProxyStatus();
      })
      .catch((err) => Logger.log(err));
  };

  const getProxyStatus = () => {
    return proxyStatus?.http && proxyStatus?.https;
  };

  const renderStatus = () => {
    if (getProxyStatus()) {
      return (
        <Tag color="green">
          <Badge status="success" />
          Proxy Online
        </Tag>
      );
    } else {
      return (
        <Tag color="red">
          <Badge status="red" />
          Proxy Offline
        </Tag>
      );
    }
  };

  const renderSteps = () => {
    if (getProxyStatus()) {
      return null;
    } else {
      return (
        <Tabs defaultActiveKey="1">
          <TabPane tab="Automatic" key="1">
            {renderAutomaticTab()}
          </TabPane>
          <TabPane tab="Manual" key="2">
            {renderManualTab()}
          </TabPane>
        </Tabs>
      );
    }
  };

  const renderAutomaticTab = () => {
    if (!getProxyStatus()) {
      return (
        <Button shape="round" onClick={onClickHandler}>
          Start Proxy
        </Button>
      );
    } else {
      return (
        <>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          &nbsp;Already running
        </>
      );
    }
  };

  const renderWindowsManual = () => {
    return (
      <List itemLayout="horizontal">
        <List.Item>
          <List.Item.Meta title="1. Navigate to Settings > Network & Internet > Proxy" />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="2. Set and Enable Proxy"
            description={
              <>
                <ul>
                  <li>
                    Address: <Tag>127.0.0.1</Tag>
                  </li>
                  <li>
                    Port: <Tag>{proxyPort}</Tag>
                  </li>
                </ul>
              </>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="3. Click Save"
            description={
              <>
                <br />
                <Image width={"100%"} src={winProxyStepsGif} />
              </>
            }
          />
        </List.Item>
      </List>
    );
  };

  const renderOsxManual = () => {
    return (
      <List itemLayout="horizontal">
        <List.Item>
          <List.Item.Meta title="1. Navigate to System Preferences > Network > Advanced > Proxies" />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="2. Set and Enable HTTP & HTTPS Proxy"
            description={
              <>
                <ul>
                  <li>
                    Web Proxy (HTTP): <Tag>127.0.0.1</Tag>:&nbsp;
                    <Tag>{proxyPort}</Tag>
                  </li>
                  <li>
                    Secure Web Proxy (HTTPS): <Tag>127.0.0.1</Tag>:&nbsp;
                    <Tag>{proxyPort}</Tag>
                  </li>
                </ul>
              </>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title='3. Press "OK" and then "Apply"'
            description={
              <>
                <br />
                <Image width={"100%"} src={proxyStepsGif} />
              </>
            }
          />
        </List.Item>
      </List>
    );
  };

  const renderManualTab = () => {
    // TODO: Add os to initial state when launching
    const ua = new UAParser(window.navigator.userAgent);
    const os = ua.getOS();
    return os.name === "Mac OS" ? renderOsxManual() : renderWindowsManual();
  };

  return (
    <>
      {renderStatus()}
      {renderSteps()}
    </>
  );
};

export default ProxyInstructions;
