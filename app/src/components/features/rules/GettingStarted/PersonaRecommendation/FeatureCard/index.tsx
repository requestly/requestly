import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { snakeCase } from "lodash";
import { Feature } from "../types";
import { trackPersonaRecommendationSelected } from "modules/analytics/events/misc/personaSurvey";
import "./FeatureCard.css";

interface Props extends Feature {
  isUserLoggedIn: boolean;
}

export const FeatureCard: React.FC<Props> = ({
  icon,
  title,
  subTitle,
  link,
  isUserLoggedIn,
}) => {
  const Icon = icon;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showAuthModal = useCallback(
    (callback: () => void) => {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            callback,
            userActionMessage: "Please sign up.",
            src: APP_CONSTANTS.FEATURES.RULES,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            eventSource: AUTH.SOURCE.PERSONA_RECOMMENDATION_SCREEN,
          },
        })
      );
    },
    [dispatch]
  );

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const callback = () => {
        trackPersonaRecommendationSelected(snakeCase(title), "screen");
        navigate(link);
      };

      if (isUserLoggedIn) {
        callback();
      } else {
        showAuthModal(callback);
      }
    },
    [title, link, isUserLoggedIn, navigate, showAuthModal]
  );

  return (
    <div className="feature-card" onClick={handleNavigation}>
      <div className="feature-title-wrapper">
        <span className="feature-icon">{<Icon />}</span>
        <span className="feature-title">{title}</span>
      </div>
      <div className="feature-subtitle">{subTitle}</div>
    </div>
  );
};
