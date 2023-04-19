import React, { ReactNode } from "react";
import { Tooltip } from "antd";
import "./index.css";

interface TagProps {
  title: string;
  description: string | ReactNode;
  tooltipWidth: string;
}

export const InfoTag: React.FC<TagProps> = ({ title, description, tooltipWidth }) => {
  return (
    <Tooltip
      title={description}
      showArrow={false}
      overlayInnerStyle={{
        width: tooltipWidth,
        textAlign: "center",
        color: "var(--text-gray)",
      }}
    >
      <div className="mode-specific-tag">{title}</div>
    </Tooltip>
  );
};
