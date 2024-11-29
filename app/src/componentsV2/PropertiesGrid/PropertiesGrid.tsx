import React from "react";
import "./propertiesGrid.scss";

interface PropertiesGridProps {
  data: {
    [key: string]: string | number | boolean | null;
  }[];
}

export const PropertiesGrid: React.FC<PropertiesGridProps> = ({ data }) => {
  return (
    <div className="properties-grid-container">
      {data.map((item) => {
        return (
          <div className="properties-grid-item">
            <div className="properties-grid-item__key">{item.key}</div>
            <div className="properties-grid-item__value">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
};
