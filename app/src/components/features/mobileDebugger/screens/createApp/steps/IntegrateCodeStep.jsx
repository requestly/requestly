import { Row, Col, Button, Typography, Divider } from "antd";
import ProCard from "@ant-design/pro-card";
import AndroidIntegration from "./integration/AndroidIntegration";

const { Title } = Typography;

const IntegrateCodeStep = ({ nextHandler, backHandler, sdkKey, platformId }) => {
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
            Next
          </Button>
        </Col>
      </Row>
    );
  };

  const renderIntegrationSteps = () => {
    if (platformId === "android") {
      return <AndroidIntegration sdkKey={sdkKey} platform={platformId} />;
    }
  };

  return (
    <ProCard>
      <Title level={4}>Integration Steps</Title>
      <Divider />
      {renderIntegrationSteps()}
      <Divider />
      {renderNavigationButtons()}
    </ProCard>
  );
};

export default IntegrateCodeStep;
