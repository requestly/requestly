import React from "react";
import { Card } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { trackHomeFeatureCardClicked } from "../../../modules/analytics/screens/home";

interface FeatureCardProps {
  name: string;
  info: string;
  navigateTo: string;
  setupText: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ name, info, navigateTo, setupText, icon }: FeatureCardProps) => {
  return (
    <Card
      size="small"
      style={{
        width: 280,
        minWidth: 200,
      }}
    >
      {icon}
      <h2>{name}</h2>
      <p className="feature-card-info">{info}</p>
      <a
        href={navigateTo}
        className="setup-box"
        onClick={() => {
          trackHomeFeatureCardClicked(name);
        }}
      >
        <p>{setupText}</p>
        <ArrowRightOutlined />
      </a>
    </Card>
  );
};

export default FeatureCard;
