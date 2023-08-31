import React, { useMemo } from "react";
import { Badge } from "antd";

interface Props {
  status: number;
  statusText?: string;
}

export enum StatusLightType {
  SUCCESS = "#268e6c",
  WARNING = "#d3a403",
  ERROR = "#ff4d4f",
  INFO = "#157af3",
  NEUTRAL = "#5c5c5c",
}

export const NetworkStatusField: React.FC<Props> = ({ status, statusText }) => {
  const statusLightType = useMemo<StatusLightType>(() => {
    if (!status) {
      return StatusLightType.ERROR;
    }

    if (status >= 200 && status < 300) {
      return StatusLightType.SUCCESS;
    }

    if (status >= 300 && status < 400) {
      return StatusLightType.WARNING;
    }

    if (status >= 400) {
      return StatusLightType.ERROR;
    }

    return StatusLightType.INFO;
  }, [status]);

  return <Badge color={statusLightType} text={`${status || "Failed"} ${statusText ? statusText : ""}`} />;
};
