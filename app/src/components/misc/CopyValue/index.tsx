import React from "react";
import { Typography } from "antd";
import CopyButton from "../CopyButton";
import "./index.css";

interface CopyValueProps {
  value: string;
}

export const CopyValue: React.FC<CopyValueProps> = ({ value }) => {
  return (
    <div className="copy-value-wrapper">
      <Typography.Text ellipsis>{value}</Typography.Text>
      <CopyButton type="primary" copyText={value} title={null} />
    </div>
  );
};
