import React from "react";
import "./emptyState.scss";

export const EmptyState: React.FC<{ imageSrc?: string; title: string; description: string }> = ({
  title,
  imageSrc,
  description,
}) => {
  return (
    <div className="runResultEmptyState">
      <img width={80} height={80} src={imageSrc ?? "/assets/media/home/empty-card.svg"} alt="empty view" />
      <div className="title">{title}</div>
      <div className="description">{description}</div>
    </div>
  );
};
