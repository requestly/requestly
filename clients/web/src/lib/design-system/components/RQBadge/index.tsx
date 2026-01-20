import React from "react";
import "./RQBadge.css";

export const RQBadge: React.FC<{ badgeText: string }> = ({ badgeText, ...props }) => {
  return (
    //@ts-ignore
    <div {...props} className={`rq-badge ${props?.className ?? ""}`}>
      <span>{badgeText}</span>
    </div>
  );
};
