import React from "react";
import { Tooltip } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { useNavigate } from "react-router-dom";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { allFeatures, recommendation } from "./personalizations";
import { trackPersonaRecommendationSelected } from "modules/analytics/events/misc/personaSurvey";
import "./index.css";

export const UserRecommendations = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
          trackPersonaRecommendationSelected(featureDetails?.title);
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
                      trackPersonaRecommendationSelected(feature.title);
                      togglePersonaSurveyModal();
                      dispatch(actions.updateIsPersonaSurveyCompleted(true));
                    }}
                  >
                    <>{feature?.icon?.()}</>
                    <div className="white">{feature.title}</div>
                  </div>
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
      <div className="divider"></div>
      <div>{renderOtherFeatures()}</div>
    </div>
  );
};
