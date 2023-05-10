import { Space, Tag } from "antd";
import React, { useMemo } from "react";
import "./betaBadge.scss";

interface Props {
  text?: string;
}

const BetaBadge: React.FC<Props> = ({ text }) => {
  const badge = useMemo(
    () => (
      <Tag color="warning" className="beta-badge">
        Beta
      </Tag>
    ),
    []
  );

  return text ? (
    <Space>
      <span>{text}</span>
      {badge}
    </Space>
  ) : (
    badge
  );
};

export default BetaBadge;
