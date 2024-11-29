import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Col, Typography } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { personaRecommendationData } from "../../personaRecommendationData";
import { FeatureCard } from "../featureCard";
import { RQButton } from "lib/design-system/components";
import { ImportRulesModal } from "features/rules/screens/rulesList/components/RulesList/components";
import { CloudUploadOutlined } from "@ant-design/icons";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import "./index.scss";

export const RecommendationGrid = () => {
  const user = useSelector(getUserAuthDetails);
  const [isImportRulesModalOpen, setIsImportRulesModalOpen] = useState(false);
  const toggleImportRulesModal = () => setIsImportRulesModalOpen(!isImportRulesModalOpen);
  return (
    <>
      <Typography.Title level={3} className="onboarding-recommendations-title">
        Select a modification type to start quickly
      </Typography.Title>
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
        <AuthConfirmationPopover
          title="You need to sign up to upload rules"
          callback={() => {
            toggleImportRulesModal();
          }}
          source={SOURCE.UPLOAD_RULES}
        >
          <RQButton
            className="items-center"
            onClick={() => {
              trackUploadRulesButtonClicked("app_onboarding_recommendation_screen");
              if (user.loggedIn) {
                toggleImportRulesModal();
              }
            }}
          >
            <CloudUploadOutlined /> Upload rules
          </RQButton>
        </AuthConfirmationPopover>
      </Col>

      {isImportRulesModalOpen ? (
        <ImportRulesModal isOpen={isImportRulesModalOpen} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};
