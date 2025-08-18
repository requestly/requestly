import { Tag } from "antd";
import React from "react";

export const RequestTabLabel: React.FC<{ label: string; count?: number; showDot?: boolean }> = ({
  label,
  count,
  showDot,
}) => {
  return (
    <div className="request-tab-label">
      <span>{label}</span>
      {count ? showDot ? <span className="request-tab-dot" /> : <Tag className="count">{count}</Tag> : null}
    </div>
  );
};
