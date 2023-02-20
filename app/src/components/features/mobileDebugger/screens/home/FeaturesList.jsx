import { Col, Divider, Row, Space, Typography } from "antd";
import ProCard from "@ant-design/pro-card";
import FeatureCard from "./FeatureCard";
import { BugOutlined, CloudServerOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import ShareButton from "./ShareButton";
import CopyText from "components/misc/CopyButton/CopyText";
import { redirectToMobileDebuggerInterceptor } from "utils/RedirectionUtils";

const { Title } = Typography;

const FeaturesList = ({ appDetails }) => {
  const navigate = useNavigate();

  const features = [
    {
      id: "interceptor",
      title: "Mobile Interceptor",
      subtitle: "Debug your mobile app traffic in realtime",
      comingSoon: false,
      action: () => {
        redirectToMobileDebuggerInterceptor(navigate, appDetails["id"]);
      },
      icon: <CloudServerOutlined />,
    },
    {
      id: "bug-report",
      title: "Bug Reports",
      subtitle: "All your bug reports show here",
      comingSoon: true,
      action: () => {},
      icon: <BugOutlined />,
    },
  ];

  const renderFeatureCard = (feature) => {
    return (
      <Col key={feature.id} span={6}>
        <FeatureCard feature={feature} />
      </Col>
    );
  };

  const renderFeaturesCards = () => {
    return <Row>{features.map((feature) => renderFeatureCard(feature))}</Row>;
  };

  return (
    <ProCard>
      <Title level={5}>
        <Space size={"large"}>
          <Space>
            <CopyText text={appDetails["name"]} size="large" /> -
            <CopyText text={appDetails["id"]} size="large" />
          </Space>
          <ShareButton appDetails={appDetails} />
        </Space>
      </Title>
      <Divider />
      {renderFeaturesCards()}
    </ProCard>
  );
};

export default FeaturesList;
