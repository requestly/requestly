import StatusLight, { StatusLightType } from "components/misc/StatusLight";
import React, { useMemo } from "react";

interface Props {
  status: number;
  statusText?: string;
}

const NetworkStatusField: React.FC<Props> = ({ status, statusText }) => {
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

    if (status >= 400 && status <= 599) {
      return StatusLightType.ERROR;
    }

    return StatusLightType.INFO;
  }, [status]);

  return (
    <StatusLight type={statusLightType}>
      {status || "Failed"}
      {statusText ? ` ${statusText}` : null}
    </StatusLight>
  );
};

export default NetworkStatusField;
