import React, { ReactNode } from "react";

interface Props {
  icon: string | ReactNode;
  title: string;
  description?: string;
  primaryButton?: ReactNode;
  secondaryButton?: ReactNode;
}

export const HomepageEmptyCard: React.FC<Props> = ({ icon, title, description, primaryButton, secondaryButton }) => {
  return (
    <div className="homepage-emptycard">
      {typeof icon === "string" ? (
        <img src={icon} alt="icon" className="homepage-emptycard-icon-img" />
      ) : (
        <div className="homepage-emptycard-icon">{icon}</div>
      )}
      <div className="homepage-emptycard-title">{title}</div>
      <div className="mt-8 text-center homepage-emptycard-description">{description}</div>
      <div className="homepage-emptycard-actions">
        <div>{primaryButton}</div>
        <div className="mt-8">{secondaryButton}</div>
      </div>
    </div>
  );
};
