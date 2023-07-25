import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "antd";
import { FeatureTag } from "components/common/FeatureTag";
import { homeCardsData } from "./homeCardsData";
import { EcosystemFeature, HomeEcosystemTypes } from "./types";
import "./index.scss";

interface CardProps {
  ecosystemType: HomeEcosystemTypes;
}

export const GridCards: React.FC<CardProps> = ({ ecosystemType }) => {
  const navigate = useNavigate();
  return (
    <>
      {homeCardsData[ecosystemType].map((feature: EcosystemFeature, index: number) => (
        <div className="home-v2-grid-card" key={index} onClick={() => navigate(feature.navigateTo)}>
          <Typography.Title className="home-v2-grid-card-title">{feature.title}</Typography.Title>
          <Typography.Text className="home-v2-grid-card-description">{feature.description}</Typography.Text>
          <FeatureTag feature={feature.tag} />
        </div>
      ))}
    </>
  );
};
