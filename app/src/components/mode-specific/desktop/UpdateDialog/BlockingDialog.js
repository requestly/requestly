import { Button, Modal, Progress, Typography, Row, Col } from "antd";
import { FiSun } from "@react-icons/all-files/fi/FiSun";
import "./BlockingDialog.scss";

const { Text, Title } = Typography;

/* NOT BEING USED */
const BlockingDialog = ({ updateDetails, isUpdateAvailable, isUpdateDownloaded, quitAndInstall, updateProgress }) => {
  const handleUpdateClick = () => {
    quitAndInstall();
  };

  /*
    Also shown with progress bar when update cache is present
    Hence default value of percent is 100
    The CTA button here also confirms if update is actually present.
    It is disabled otherwise
  */
  const renderUpdateProgress = (percent = 100.0) => {
    return (
      <>
        <Row align="middle" className="w-full">
          <Col align="center" span={24}>
            <FiSun />
            <Row justify="center" className="w-full">
              {percent >= 100 ? <Text>Download Complete</Text> : <Text>Download in progress...</Text>}
            </Row>
            <Row justify="center" className="w-full">
              <Title level={3} className="download-progress-text">
                {percent.toFixed(0) + "%"}
              </Title>
            </Row>
          </Col>
          <Progress percent={percent} status="active" strokeColor="#00C8AF" showInfo={false} />
        </Row>
        <Row className="" align="center">
          <Col align="center" span={24}>
            <Button
              type="primary"
              className={!isUpdateDownloaded ? "disabled-download-btn" : "download-btn"}
              onClick={() => {
                if (!isUpdateDownloaded) return;
                handleUpdateClick();
              }}
            >
              <Text>Install and Restart</Text>
            </Button>
          </Col>
        </Row>
      </>
    );
  };

  const renderUpdaterContent = () => {
    if (isUpdateDownloaded) {
      return renderUpdateProgress();
    } else {
      /*
        passing 0.00 for when updates are still being fetched
        we are assuming that if this dialog is shown, update download will eventually start
      */
      return renderUpdateProgress(updateProgress?.percent || 0.0);
    }
  };
  return (
    <Modal
      className="transparent-dialog"
      mask={true}
      centered="true"
      closeIcon={<></>}
      visible={true}
      closable="false"
      footer={null}
    >
      {renderUpdaterContent()}
    </Modal>
  );
};

export default BlockingDialog;
