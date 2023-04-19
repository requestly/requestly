import ProCard from "@ant-design/pro-card";
import { Badge, Button, Divider, Typography } from "antd";

const { Title } = Typography;

const FeatureCard = ({ feature }) => {
  const renderSubtitle = (subtitle) => {
    return <div style={{ textAlign: "center", paddingBottom: 8 }}>{subtitle}</div>;
  };

  const onClickHandler = () => {
    feature.action();
  };

  const renderCtaButton = (url) => {
    return (
      <div style={{ textAlign: "center", paddingBottom: 8 }}>
        <Button onClick={onClickHandler} disabled={feature.comingSoon}>
          Try Now
        </Button>
      </div>
    );
  };

  return (
    <ProCard className="github-like-border">
      <Title level={5}>
        {feature.icon} {feature.title} {feature.comingSoon ? <Badge count={"Coming Soon"} /> : null}
      </Title>
      <Divider />
      {renderSubtitle(feature.subtitle)}
      {renderCtaButton(feature.url)}
    </ProCard>
  );
};

export default FeatureCard;
