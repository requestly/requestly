import { Button, Tabs, List, Tag, Image } from "antd";
import { LockOutlined, DownloadOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { saveRootCert } from "actions/DesktopActions";
import UAParser from "ua-parser-js";
import Logger from "lib/logger";

const { TabPane } = Tabs;

const CertsInstructions = () => {
  const [certStatus, setCertStatus] = useState({
    installed: false,
    trusted: false,
  });

  const fetchCertStatus = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("system-wide-cert-status", {})
      .then((res) => {
        setCertStatus(res);
      })
      .catch((err) => Logger.log(err));
  };

  useEffect(() => {
    fetchCertStatus();
  }, []);

  const onClickHandler = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("system-wide-cert-trust", {})
      .then((res) => {
        fetchCertStatus();
      })
      .catch((err) => Logger.log(err));
  };

  const getCertStatus = () => {
    return certStatus?.installed && certStatus?.trusted;
  };

  const renderStatus = () => {
    let installedBadge = null;
    let trustedBadge = null;
    if (certStatus?.installed) {
      installedBadge = (
        <Tag color="green">
          <DownloadOutlined /> Installed
        </Tag>
      );
    } else {
      installedBadge = (
        <Tag color="red">
          <DownloadOutlined /> Not Installed
        </Tag>
      );
    }

    if (certStatus?.trusted) {
      trustedBadge = (
        <Tag color="green">
          <LockOutlined /> Trusted
        </Tag>
      );
    } else {
      trustedBadge = (
        <Tag color="red">
          <LockOutlined /> Not Trusted
        </Tag>
      );
    }

    return (
      <>
        {installedBadge} {trustedBadge}
      </>
    );
  };

  const renderSteps = () => {
    if (getCertStatus()) {
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
    if (!certStatus?.installed) {
      return (
        <Button shape="round" onClick={onClickHandler}>
          Install & Trust
        </Button>
      );
    } else {
      if (certStatus?.trusted) {
        return (
          <>
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            &nbsp;Already installed & trusted
          </>
        );
      } else {
        return (
          <>
            <Button shape="round" onClick={onClickHandler}>
              Click here to Trust
            </Button>
          </>
        );
      }
    }
  };

  const renderWindowsManual = () => {
    return (
      <List itemLayout="horizontal">
        <List.Item>
          <List.Item.Meta
            title="1. Download Requestly Certs"
            description={
              <Button shape="round" onClick={saveRootCert}>
                <DownloadOutlined /> Save Certificate
              </Button>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="2. Import and Trust Certificate "
            description={
              <>
                <ul>
                  <li>
                    Open start menu and search for <b>Manage user certificates</b>
                  </li>
                  <li>
                    Open <b>Trusted Root Certification Authorities</b> from the left panel
                  </li>
                  <li>
                    Right click on <b>Certificates</b>
                  </li>
                  <li>
                    Click on <b>Certificates &gt; import ...</b>
                  </li>
                  <li>Import the certificate you downloaded in the previous step (RQProxyCA.pem)</li>
                </ul>
                <Image width={"100%"} src={"/assets/media/components/install_win_cert.gif"} />
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
          <List.Item.Meta
            title="1. Download Requestly Certs"
            description={
              <Button shape="round" onClick={saveRootCert}>
                <DownloadOutlined /> Save Certificate
              </Button>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="2. Import Certs in keychain"
            description={
              <>
                <ul>
                  <li>Go to keychain access (Press cmd + enter and then type "keychain")</li>
                  <li>Select login keychain</li>
                  <li>Click on "File"</li>
                  <li>Click on "Import Items"</li>
                  <li>Import the cert you downloaded in the previous step (RQProxyCA.pem)</li>
                </ul>
                <Image width={"100%"} src={"/assets/media/components/import_cert.gif"} />
              </>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="3. Mark certs as trusted"
            description={
              <>
                <ul>
                  <li>Double Click on the certificate(RQProxyCA) imported in previous step</li>
                  <li>In Trust Section, Select "Always Trust" for "When using this certificate" </li>
                  <li>Close the window (Admin permissions required)</li>
                </ul>
                <Image width={"100%"} src={"/assets/media/components/trust_cert.gif"} />
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

export default CertsInstructions;
