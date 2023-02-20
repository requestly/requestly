import { Row, Col, Button, Typography, Divider } from "antd";
import ProCard from "@ant-design/pro-card";

const { Title } = Typography;

const TestIntegrationStep = ({ nextHandler, backHandler }) => {
  const onNextClickHandler = () => {
    nextHandler();
  };

  const onBackClickHandler = () => {
    backHandler();
  };

  const renderNavigationButtons = () => {
    return (
      <Row justify="space-between">
        <Col>
          <Button onClick={onBackClickHandler}>Back</Button>
        </Col>
        <Col>
          <Button type="primary" onClick={onNextClickHandler}>
            Finish
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <ProCard>
      <Title level={4}>Test Integration</Title>
      <Divider />
      <p align="center">
        <iframe
          title="Remote Rules"
          style={{ aspectRatio: "16/9" }}
          width="50%"
          src="https://www.youtube.com/embed/Zf4iJjnhPzY"
        ></iframe>
      </p>
      <Divider />
      {renderNavigationButtons()}
    </ProCard>
  );
};

export default TestIntegrationStep;
