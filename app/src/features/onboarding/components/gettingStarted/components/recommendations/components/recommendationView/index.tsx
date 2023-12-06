import { useState } from "react";
import { Col, Typography } from "antd";
import { personaRecommendationData } from "../../personaRecommendationData";
import { FeatureCard } from "../featureCard";
import { RQButton } from "lib/design-system/components";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import { CloudUploadOutlined } from "@ant-design/icons";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import "./index.scss";

export const RecommendationView = () => {
  const [isImportRulesModalOpen, setIsImportRulesModalOpen] = useState(false);
  const toggleImportRulesModal = () => setIsImportRulesModalOpen(!isImportRulesModalOpen);
  return (
    <>
      <Col>
        {personaRecommendationData.map(({ section, features }, index) => (
          <div key={section} style={{ marginTop: index !== 0 ? "24px" : 0 }}>
            <div className="recommendation-title">{section}</div>
            <div className="recommendation-row">
              {features.map((feature) => (feature.disabled ? null : <FeatureCard {...feature} key={feature.id} />))}
            </div>
          </div>
        ))}
        <Typography.Title level={5} className="getting-started-import-rules-title">
          Have existing rules? Click below to upload and use them
        </Typography.Title>
        <RQButton
          className="items-center"
          onClick={() => {
            trackUploadRulesButtonClicked("app_onboarding_recommendation_screen");
            toggleImportRulesModal();
          }}
        >
          <CloudUploadOutlined /> Upload rules
        </RQButton>
      </Col>
      <ImportRulesModal isOpen={isImportRulesModalOpen} toggle={toggleImportRulesModal} />
    </>
  );
};
