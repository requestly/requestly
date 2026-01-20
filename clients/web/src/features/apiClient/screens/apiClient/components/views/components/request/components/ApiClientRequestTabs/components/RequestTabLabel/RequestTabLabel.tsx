import { Tag } from "antd";
import React from "react";

interface RequestTabLabelProps {
  label: string;
  count?: number;
  showDot?: boolean;
  dotIndicator?: "success" | "error";
}

export const RequestTabLabel: React.FC<RequestTabLabelProps> = ({ label, count, showDot, dotIndicator }) => {
  return (
    <div className="request-tab-label">
      <span>{label}</span>
      <RequestTabLabelIndicator count={count} showDot={showDot} dotIndicator={dotIndicator} />
    </div>
  );
};

export const RequestTabLabelIndicator: React.FC<{
  count?: number;
  showDot?: boolean;
  dotIndicator?: "success" | "error";
}> = ({ count, showDot, dotIndicator }) => {
  if (!count) return null;

  if (showDot) {
    if (dotIndicator === "error") return <span className="request-tab-dot-error" />;
    else return <span className="request-tab-dot-success" />;
  }

  return <Tag className="count">{count}</Tag>;
};
