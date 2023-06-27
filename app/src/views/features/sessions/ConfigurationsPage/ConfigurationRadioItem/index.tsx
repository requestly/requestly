import React from "react";
import { Radio, RadioProps } from "antd";
import "./configurationRadioItem.css";

interface Props extends RadioProps {
  title: string;
  caption: string;
  value: string;
}

export const ConfigurationRadioItem: React.FC<Props> = ({ value, title, caption, disabled = false }) => {
  return (
    <Radio disabled={disabled} value={value} className="configuration-radio-item">
      <span className="info">
        <span className="title">{title}</span>
        <span className="caption">{caption}</span>
      </span>
    </Radio>
  );
};
