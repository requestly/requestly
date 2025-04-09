import React from "react";
import "./RQBadge.css";

export const RQBadge: React.FC<{ badgeText: string; className?: string }> = ({ badgeText, className, ...props }) => {
  return (
    <div {...props} className={`rq-badge ${className ?? ""}`}>
      <span>{badgeText}</span>
    </div>
  );
};
