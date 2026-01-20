import { Button, Modal, Typography, Row, Col } from "antd";
import "./BreakingDialog.scss";
import { getLinkWithMetadata } from "modules/analytics/metadata";

const { Text, Title } = Typography;

/* NOT BEING USED */
const BreakingDialog = () => {
  const handleUpdateClick = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: getLinkWithMetadata("https://requestly.com/desktop"),
    });
  };

  const renderUpdaterContent = () => {
    return (
      <Row className="w-full" align="center">
        <Title level={3}>This is an unsupported version.</Title>
        <Col align="center" span={24}>
          <Button
            type="primary"
            onClick={() => {
              handleUpdateClick();
            }}
          >
            <Text>Download latest version 🚀</Text>
          </Button>
        </Col>
      </Row>
    );
  };
  return (
    <Modal
      className="rounded-dialog"
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

export default BreakingDialog;
