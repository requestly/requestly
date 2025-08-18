import { Typography } from "antd";
import React, { ReactNode } from "react";
import { RQTooltip } from "lib/design-system-v2/components";
import "./propertyRow.scss";

interface Props {
  name?: string;
  value: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const PropertyRow: React.FC<Props> = ({ name = "", value, actions, className = "" }) => {
  return (
    <RQTooltip title={name}>
      <div className={`property-row ${className}`}>
        <Typography.Text className="property-value">{value ?? "(empty)"}</Typography.Text>
        {actions ? <div className="property-actions">{actions}</div> : null}
      </div>
    </RQTooltip>
  );
};

export default PropertyRow;
