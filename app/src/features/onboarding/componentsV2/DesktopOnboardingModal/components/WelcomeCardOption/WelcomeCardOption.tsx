import React from "react";
import "./welcomeCardOption.scss";

interface WelcomeCardOptionProps {
  title: string;
  description: string;
  iconSrc: string;
  onClick: () => void;
}
export const WelcomeCardOption: React.FC<WelcomeCardOptionProps> = ({
  title,
  description,
  iconSrc,
  onClick,
}: WelcomeCardOptionProps) => {
  return (
    <div className="welcome-card-option" onClick={onClick}>
      <div className="welcome-card-option__icon">
        <img src={iconSrc} alt={title} />
      </div>
      <div className="welcome-card-option__content">
        <div className="welcome-card-option__content-title">{title}</div>
        <div className="welcome-card-option__content-description">{description}</div>
      </div>
    </div>
  );
};
