import React from "react";
import { Typography } from "antd";
import CopyButton from "../CopyButton";
import "./index.css";

interface CopyValueProps {
  title: string;
  value: string;
  trackCopiedEvent?: () => void;
}

export const CopyValue: React.FC<CopyValueProps> = ({ title, value, trackCopiedEvent }) => {
  return (
    <div className="copy-value-wrapper">
      <Typography.Text ellipsis>{value}</Typography.Text>
      <CopyButton type="primary" copyText={value} title={title} trackCopiedEvent={trackCopiedEvent} />
    </div>
  );
};
