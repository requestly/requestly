import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Feature } from "../../types";
import "./index.scss";

export const FeatureCard: React.FC<Feature> = ({ id, icon: Icon, title, subTitle, link, tag = "" }) => {
  const navigate = useNavigate();

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      navigate(link, { replace: true });
    },
    [navigate, link]
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
