import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Feature } from "../../types";
import { globalActions } from "store/slices/global/slice";
import {
  trackAppOnboardingRecommendationSelected,
  trackAppOnboardingStepCompleted,
} from "features/onboarding/analytics";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import "./index.scss";

export const FeatureCard: React.FC<Feature> = ({ id, icon: Icon, title, subTitle, link, tag = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      trackAppOnboardingStepCompleted(ONBOARDING_STEPS.GETTING_STARTED);
      trackAppOnboardingRecommendationSelected(id);
      dispatch(globalActions.updateAppOnboardingCompleted());
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "appOnboardingModal",
          newValue: false,
        })
      );
      navigate(link, { replace: true });
    },
    [navigate, link, dispatch, id]
  );

  return (
    <div className="recommendation-card" onClick={handleNavigation}>
      <div className="recommendation-card-title-wrapper">
        <span className="recommendation-card-icon">{<Icon />}</span>
        <span className="recommendation-card-title">{title}</span>
      </div>
      <div className="recommendation-card-subtitle">{subTitle}</div>
    </div>
  );
};
