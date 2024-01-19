import React from "react";
import { Radio, RadioProps } from "antd";
import "./sessionSettingsRadioItem.css";

interface Props extends RadioProps {
  title: string;
  caption: string;
  value: string;
}

export const SessionSettingsRadioItem: React.FC<Props> = ({ value, title, caption, disabled = false }) => {
  return (
    <Radio disabled={disabled} value={value} className="session-settings-radio-item">
      <span className="info">
        <span className="title">{title}</span>
        <span className="caption">{caption}</span>
      </span>
    </Radio>
  );
};
