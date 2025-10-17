import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";

export const ImportErrorView: React.FC<{ importError: string }> = ({ importError }) => {
  return (
    <div className="import-error">
      <div className="import-error-heading">
        <InfoCircleOutlined className="icon__wrapper" />
        {importError}.
      </div>
    </div>
  );
};
