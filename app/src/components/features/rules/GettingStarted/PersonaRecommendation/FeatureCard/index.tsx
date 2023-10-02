import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actions } from "store";
import { Feature } from "../types";
import { RQBadge } from "lib/design-system/components/RQBadge";
import { ReactComponent as RightChevron } from "assets/icons/chevron-right.svg";
import { trackPersonaRecommendationSelected } from "modules/analytics/events/misc/onboarding";
import "./FeatureCard.css";

export const FeatureCard: React.FC<Feature> = ({ id, icon: Icon, title, subTitle, link, tag = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      trackPersonaRecommendationSelected(id);
      dispatch(actions.updateIsPersonaSurveyCompleted(true));
      dispatch(actions.updateIsWorkspaceOnboardingCompleted());
      navigate(link, { replace: true });
    },
    [id, dispatch, navigate, link]
  );

  return (
    <div className="feature-card" onClick={handleNavigation}>
      <div className="feature-title-container">
        <div className="feature-title-wrapper">
          <span className="feature-icon">{<Icon />}</span>
          <span className="feature-title">{title}</span>
          {!!tag && <RQBadge badgeText={tag} />}
        </div>
        <span className="right-chevron">
          <RightChevron />
        </span>
      </div>
      <div className="feature-subtitle">{subTitle}</div>
    </div>
  );
};
