/* eslint-disable no-unused-vars */
import React from "react";
import "./statusLight.scss";

export enum StatusLightType {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
  NEUTRAL = "neutral",
}

interface Props {
  type: StatusLightType;
  children: React.ReactNode;
}

const StatusLight: React.FC<Props> = ({ type = StatusLightType.NEUTRAL, children }) => {
  return <div className={`status-light ${type}`}>{children}</div>;
};

export default StatusLight;
