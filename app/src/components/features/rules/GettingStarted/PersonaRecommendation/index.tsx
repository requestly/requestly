import React, { useMemo, useState } from "react";
import { Button, Row } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { personaRecommendationData } from "./personaRecommendationData";
import { RQButton } from "lib/design-system/components";
import { AUTH } from "modules/analytics/events/common/constants";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { FeatureCard } from "./FeatureCard";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import "./PersonaRecommendation.css";

interface Props {
  isUserLoggedIn: boolean;
  handleUploadRulesClick: () => void;
}

const PersonaRecommendation: React.FC<Props> = ({
  isUserLoggedIn,
  handleUploadRulesClick,
}) => {
  const [isViewAllOptions, setIsViewAllOptions] = useState<boolean>(false);
  const data = useMemo(
    () =>
      isViewAllOptions
        ? personaRecommendationData
        : personaRecommendationData.slice(0, 3),
    [isViewAllOptions]
  );

  return (
    <div className="persona-recommendation-container">
      <h2 className="header">✨ Quick and easy ways to get started</h2>
      <div>
        {data.map(({ section, features }) => (
          <div key={section}>
            <div className="section-header">{section}</div>
            <div className="section-row">
              {features.map((feature) => (
                <FeatureCard
                  {...feature}
                  key={feature.title}
                  isUserLoggedIn={isUserLoggedIn}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isViewAllOptions && (
        <Row align="middle" justify="center">
          <Button
            type="text"
            className="view-all-options-btn"
            onClick={() => setIsViewAllOptions(true)}
          >
            View all options
          </Button>
        </Row>
      )}

      <div className="persona-recommendation-footer">
        <div className="upload-rule-message">
          or If you have existing rule, click here to upload them.{" "}
        </div>

        <AuthConfirmationPopover
          title="You need to sign up to upload rules"
          callback={handleUploadRulesClick}
          source={AUTH.SOURCE.UPLOAD_RULES}
        >
          <RQButton
            className="items-center upload-btn"
            onClick={() => {
              trackUploadRulesButtonClicked(
                AUTH.SOURCE.PERSONA_RECOMMENDATION_SCREEN
              );
              if (isUserLoggedIn) {
                handleUploadRulesClick();
              }
            }}
          >
            <CloudUploadOutlined /> Upload rules
          </RQButton>
        </AuthConfirmationPopover>
      </div>
    </div>
  );
};

export default PersonaRecommendation;
