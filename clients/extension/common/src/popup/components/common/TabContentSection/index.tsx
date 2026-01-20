import "./tabContentSection.css";
import React from "react";
import { Typography } from "antd";

interface Props {
  heading?: string;
  children: React.ReactElement;
}

const TabContentSection: React.FC<Props> = ({ heading = "", children }) => {
  return (
    <div className="tab-content-section">
      {heading.length > 0 && <Typography.Title level={5}>{heading}</Typography.Title>}
      <div>{children}</div>
    </div>
  );
};

export default TabContentSection;
