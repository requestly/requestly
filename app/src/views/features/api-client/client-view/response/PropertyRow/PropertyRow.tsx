import { Typography } from "antd";
import React, { ReactNode } from "react";
import "./propertyRow.scss";

interface Props {
  name: string;
  value: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const PropertyRow: React.FC<Props> = ({ name, value, actions, className = "" }) => {
  return (
    <div className={`property-row ${className}`}>
      <Typography.Text type="secondary" className="property-name">
        {name}:
      </Typography.Text>
      <Typography.Text className="property-value">{value ?? "(empty)"}</Typography.Text>
      {actions ? <div className="property-actions">{actions}</div> : null}
    </div>
  );
};

export default PropertyRow;
