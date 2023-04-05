import React from "react";
import { Tooltip } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { useNavigate } from "react-router-dom";
import {
  getUserPersonaSurveyDetails,
  getUserAuthDetails,
} from "store/selectors";
import { allFeatures, recommendation } from "./personalizations";
import { trackPersonaRecommendationSelected } from "modules/analytics/events/misc/personaSurvey";
import "./index.css";
import { RQButton } from "lib/design-system/components";
import { AiOutlineCloudUpload } from "react-icons/ai";
//@ts-ignore
import arrowRightSm from "assets/icons/arrow-right-sm.svg";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { AUTH } from "modules/analytics/events/common/constants";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";

interface RecommendationsProps {
  toggleImportRulesModal: () => void;
}

export const UserRecommendations: React.FC<RecommendationsProps> = ({
  toggleImportRulesModal,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userPersonaDetails = useSelector(getUserPersonaSurveyDetails);
  const userRole = userPersonaDetails.persona;
  const recommendedFeatures = recommendation.find(
    (feature) => feature.id === userRole
  );

  const togglePersonaSurveyModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal" }));
  };
  const renderRecommendedFeature = (feature: string) => {
    const featureDetails = allFeatures.find(
      (personalization) => personalization.title === feature
    );

    return (
      <div
        className="recommended-feature-container"
        onClick={() => {
          featureDetails.action(navigate);
          trackPersonaRecommendationSelected(featureDetails?.title, "modal");
          togglePersonaSurveyModal();
          dispatch(actions.updateIsPersonaSurveyCompleted(true));
        }}
      >
        <div className="recommended-feature-title">
          <>{featureDetails?.icon?.()}</>
          <div className="white">{featureDetails?.title}</div>
        </div>
        <div className="text-gray recommended-feature-description">
          {featureDetails?.description}
        </div>
      </div>
    );
  };

  const renderOtherFeatures = () => {
    return (
      <div className="recommendations-card-container">
        {allFeatures.map((feature, index) => (
          <React.Fragment key={index}>
            {!recommendedFeatures.recommended.includes(feature.id) && (
              <div className="other-recommended-feature-container">
                <Tooltip title={feature.description} showArrow={false}>
                  <div
                    className="recommended-feature-title"
                    onClick={() => {
                      feature.action(navigate);
                      trackPersonaRecommendationSelected(
                        feature.title,
                        "modal"
                      );
                      togglePersonaSurveyModal();
                      dispatch(actions.updateIsPersonaSurveyCompleted(true));
                    }}
                  >
                    <>{feature?.icon?.()}</>
                    <div className="white">{feature.title}</div>
                  </div>
                  <img
                    alt="arrow"
                    width="16px"
                    height="16px"
                    src={arrowRightSm}
                  />
                </Tooltip>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-card-container">
        {recommendedFeatures.recommended.map((feature, index) => (
          <React.Fragment key={index}>
            {renderRecommendedFeature(feature)}
          </React.Fragment>
        ))}
      </div>
      <div>{renderOtherFeatures()}</div>
      <div className="divider"></div>
      <div className="text-gray survey-upload-rule-text">
        If you have existing rule, click here to upload them.{" "}
      </div>
      <AuthConfirmationPopover
        title="You need to sign up to upload rules"
        callback={() => {
          toggleImportRulesModal();
          dispatch(actions.updateIsPersonaSurveyCompleted(true));
        }}
        source={AUTH.SOURCE.UPLOAD_RULES}
      >
        <RQButton
          type="default"
          className="survey-upload-btn"
          icon={<AiOutlineCloudUpload />}
          onClick={() => {
            if (user?.loggedIn) {
              toggleImportRulesModal();
              dispatch(actions.updateIsPersonaSurveyCompleted(true));
              trackUploadRulesButtonClicked(AUTH.SOURCE.PERSONA_SURVEY);
            }
          }}
        >
          {" "}
          Upload rules
        </RQButton>
      </AuthConfirmationPopover>
    </div>
  );
};
