import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
  trackPersonaSurveyViewAllOptionsClicked,
} from "modules/analytics/events/misc/personaSurvey";
import "./PersonaRecommendation.css";

interface Props {
  isUserLoggedIn: boolean;
  handleUploadRulesClick: () => void;
}

const PersonaRecommendation: React.FC<Props> = ({ isUserLoggedIn, handleUploadRulesClick }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const [isViewAllOptions, setIsViewAllOptions] = useState<boolean>(false);

  const data = useMemo(() => (isViewAllOptions ? personaRecommendationData : personaRecommendationData.slice(0, 3)), [
    isViewAllOptions,
  ]);

  const handleSkipClick = (e: React.MouseEvent<HTMLElement>) => {
    trackPersonaRecommendationSkipped();

    navigate(
      //@ts-ignore
      state?.redirectTo?.includes(PATHS.GETTING_STARTED)
        ? PATHS.RULES.MY_RULES.ABSOLUTE
        : //@ts-ignore
          state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
      { replace: true }
    );
    dispatch(actions.updateIsWorkspaceOnboardingCompleted());
    dispatch(actions.updateIsPersonaSurveyCompleted(true));
  };

  const handleViewAllOptionsClick = (e: React.MouseEvent<HTMLElement>) => {
    setIsViewAllOptions(true);
    trackPersonaSurveyViewAllOptionsClicked();
  };

  return (
    <>
      <Row align="middle" justify="end">
        <Button type="text" onClick={handleSkipClick} className="persona-recommendation-skip-btn">
          Skip
        </Button>
      </Row>
      <div className="persona-recommendation-container">
        <h2 className="header">✨ Quick and easy ways to get started</h2>
        <div>
          {data.map(({ section, features }) => (
            <div key={section}>
              <div className="section-header">{section}</div>
              <div className="section-row">
                {features.map((feature) => (feature.disabled ? null : <FeatureCard {...feature} key={feature.id} />))}
              </div>
            </div>
          ))}
        </div>

        {!isViewAllOptions && (
          <Row align="middle" justify="center">
            <Button type="text" className="view-all-options-btn" onClick={handleViewAllOptionsClick}>
              View all options
            </Button>
          </Row>
        )}

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
