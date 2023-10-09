import React from "react";
import { Button, ButtonProps } from "antd";
import "./primaryActionButton.css";

export const PrimaryActionButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      {...props}
      className={`primary-action-btn ${props.className ?? ""} ${
        props.size === "small" ? "primary-action-btn-small" : ""
      }`}
    />
  );
};
