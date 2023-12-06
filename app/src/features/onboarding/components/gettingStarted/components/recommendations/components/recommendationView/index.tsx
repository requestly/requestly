import { Col } from "antd";
import { personaRecommendationData } from "../../personaRecommendationData";
import { FeatureCard } from "../featureCard";
import "./index.scss";

export const RecommendationView = () => {
  return (
    <Col>
      {personaRecommendationData.map(({ section, features }, index) => (
        <div key={section} style={{ marginTop: index !== 0 ? "24px" : 0 }}>
          <div className="recommendation-title">{section}</div>
          <div className="recommendation-row">
            {features.map((feature) => (feature.disabled ? null : <FeatureCard {...feature} key={feature.id} />))}
          </div>
        </div>
      ))}
    </Col>
  );
};
