import React from "react";
import { Typography } from "antd";
import "./emptyContainerPlaceholder.scss";

interface Props {
  lines: string[];
}

const EmptyContainerPlaceholder: React.FC<Props> = ({ lines }) => {
  return (
    <div className="empty-container-placeholder">
      {lines.map((line) => (
        <Typography.Text type="secondary">{line}</Typography.Text>
      ))}
    </div>
  );
};

export default EmptyContainerPlaceholder;
