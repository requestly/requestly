import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actions } from "store";
import { snakeCase } from "lodash";
import { Feature } from "../types";
import { ReactComponent as RightChevron } from "assets/icons/chevron-right.svg";
import { trackPersonaRecommendationSelected } from "modules/analytics/events/misc/personaSurvey";
import "./FeatureCard.css";

export const FeatureCard: React.FC<Feature> = ({
  icon,
  title,
  subTitle,
  link,
}) => {
  const Icon = icon;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      trackPersonaRecommendationSelected(snakeCase(title), "screen");
      dispatch(actions.updateIsPersonaSurveyCompleted(true));
      navigate(link, { replace: true });
    },
    [title, link, navigate, dispatch]
  );

  return (
    <div className="feature-card" onClick={handleNavigation}>
      <div className="feature-title-container">
        <div className="feature-title-wrapper">
          <span className="feature-icon">{<Icon />}</span>
          <span className="feature-title">{title}</span>
        </div>
        <span className="right-chevron">
          <RightChevron />
        </span>
      </div>
      <div className="feature-subtitle">{subTitle}</div>
    </div>
  );
};
