import { Tag } from "antd";
import React from "react";

interface RequestTabLabelProps {
  label: string;
  count?: number;
  showDot?: boolean;
  dotClassName?: string;
}

interface RequestTabIndicatorProps {
  count?: number;
  showDot?: boolean;
  dotClassName?: string;
}

export const RequestTabLabel: React.FC<RequestTabLabelProps> = ({ label, count, showDot, dotClassName }) => {
  return (
    <div className="request-tab-label">
      <span>{label}</span>
      <RequestTabIndicator count={count} showDot={showDot} dotClassName={dotClassName} />
    </div>
  );
};

export const RequestTabIndicator: React.FC<RequestTabIndicatorProps> = ({ count, showDot, dotClassName }) => {
  if (!count) return null;

  if (showDot) {
    return <span className={dotClassName ?? "request-tab-dot-success"} />;
  }

  return <Tag className="count">{count}</Tag>;
};
