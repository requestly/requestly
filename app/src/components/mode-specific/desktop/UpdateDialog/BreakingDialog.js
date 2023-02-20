import { Button, Modal, Typography, Row, Col } from "antd";
import "./BreakingDialog.scss";

const { Text, Title } = Typography;

const BreakingDialog = () => {
  const handleUpdateClick = () => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
      link: "https://requestly.io/desktop",
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
