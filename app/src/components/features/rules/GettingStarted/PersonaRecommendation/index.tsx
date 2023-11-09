import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Row } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { actions } from "store";
import { personaRecommendationData } from "./personaRecommendationData";
import { RQButton } from "lib/design-system/components";
import { FeatureCard } from "./FeatureCard";
import PATHS from "config/constants/sub/paths";
import { AUTH } from "modules/analytics/events/common/constants";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import {
  trackPersonaRecommendationSkipped,
  trackWorkspaceOnboardingPageViewed,
} from "modules/analytics/events/misc/onboarding";
import "./PersonaRecommendation.css";

interface Props {
  isUserLoggedIn: boolean;
  handleUploadRulesClick: () => void;
}

const PersonaRecommendation: React.FC<Props> = ({ isUserLoggedIn, handleUploadRulesClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSkipClick = (e: React.MouseEvent<HTMLElement>) => {
    trackPersonaRecommendationSkipped();
    dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    dispatch(actions.updateIsPersonaSurveyCompleted(true));
    navigate(PATHS.ROOT, { replace: true });
  };

  useEffect(() => {
    trackWorkspaceOnboardingPageViewed("persona_recommendation");
  }, []);

  return (
    <>
      <Row align="middle" justify="end">
        <Button type="text" onClick={handleSkipClick} className="persona-recommendation-skip-btn">
          Skip
        </Button>
      </Row>
      <div className="persona-recommendation-container">
        <h2 className="header">✨ Select an option to get started</h2>
        <div>
          {personaRecommendationData.map(({ section, features }) => (
            <div key={section}>
              <div className="section-header">{section}</div>
              <div className="section-row">
                {features.map((feature) => (feature.disabled ? null : <FeatureCard {...feature} key={feature.id} />))}
              </div>
            </div>
          ))}
        </div>

        <div className="persona-recommendation-footer">
          <div className="upload-rule-message">or if you have existing rules, click below to upload them. </div>

          <AuthConfirmationPopover
            title="You need to sign up to upload rules"
            callback={() => {
              handleUploadRulesClick();
              dispatch(actions.updateIsWorkspaceOnboardingCompleted());
              dispatch(actions.updateIsPersonaSurveyCompleted(true));
            }}
            source={AUTH.SOURCE.UPLOAD_RULES}
          >
            <RQButton
              className="items-center upload-btn"
              onClick={() => {
                trackUploadRulesButtonClicked(AUTH.SOURCE.PERSONA_RECOMMENDATION_SCREEN);
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
    </>
  );
};

export default PersonaRecommendation;
