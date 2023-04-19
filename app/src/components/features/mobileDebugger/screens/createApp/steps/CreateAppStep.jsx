import { Input, Radio, Typography, Space, Row, Col, Button, Divider, Badge } from "antd";
import ProCard from "@ant-design/pro-card";
import { useState } from "react";
import { APP_PLATFORMS } from "../constants";

const { Title } = Typography;

const CreateAppStep = ({ nextHandler }) => {
  const [name, setName] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const renderNameInput = () => {
    return (
      <div style={{ paddingBottom: 16 }}>
        <Title level={5}>Enter the name of your app</Title>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
    );
  };

  const renderPlatformSelector = () => {
    return (
      <div style={{ paddingBottom: 16 }}>
        <Title level={5}>Select a Plaform for the app</Title>
        <Radio.Group
          value={platform}
          onChange={(e) => {
            setPlatform(e.target.value);
          }}
        >
          <Space direction="vertical">
            {APP_PLATFORMS.map((platform) => {
              return (
                <Radio value={platform.id} key={platform.id} disabled={platform.id !== "android"}>
                  {platform.icon} {platform.name} {platform.tag ? <Badge count={platform.tag} /> : null}
                </Radio>
              );
            })}
          </Space>
        </Radio.Group>
      </div>
    );
  };

  const verifyDetails = () => {
    if (!name || !platform) {
      setErrorMessage("Name and Platform are required");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const onNextClickHandler = () => {
    if (verifyDetails()) {
      nextHandler(name, platform);
    }
  };

  const renderNavigationButtons = () => {
    return (
      <Row justify="end">
        <Col>
          <span style={{ color: "red", paddingRight: 16 }}>{errorMessage}</span>
          <Button type="primary" onClick={onNextClickHandler}>
            Next
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <ProCard>
      <Title level={4}>Create App</Title>
      <Divider />
      {renderNameInput()}
      {renderPlatformSelector()}
      <Divider />
      {renderNavigationButtons()}
    </ProCard>
  );
};

export default CreateAppStep;
