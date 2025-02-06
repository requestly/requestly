import React, { ReactNode } from "react";

interface Props {
  icon: string | ReactNode;
  title: string;
  features: string[];
  description?: string;
  primaryAction?: ReactNode;
  playIcon?: { src: string; label: string; time: string };
}

export const HomepageEmptyCard: React.FC<Props> = ({ icon, title, description, features, primaryAction, playIcon }) => {
  return (
    <>
      <div className="homepage-emptycard">
        <div className="header-section">
          {typeof icon === "string" ? (
            <img src={icon} alt="icon" className="homepage-emptycard-icon-img" />
          ) : (
            <div className="homepage-emptycard-icon">{icon}</div>
          )}
          <div className="header-content">
            <h1 className="homepage-emptycard-title">{title}</h1>
            <p className="mt-8 text-center homepage-emptycard-description">{description}</p>
          </div>
        </div>
        <ul className="features">
          {features.map((feature) => (
            <li>{feature}</li>
          ))}
        </ul>
        <div className="play-icon">
          <img src={playIcon.src} alt="Play" />
          <p>
            {playIcon.label} <span>{playIcon.time}</span>
          </p>
        </div>
      </div>
      <div className="action-section">{primaryAction}</div>
    </>
  );
};
