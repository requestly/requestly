import React from "react";
import "./breadcrumb.scss";

interface BreadcrumbProps {
  items: string[];
}

export const BreadCrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="rq-breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="rq-breadcrumb-item">{item}</span>
          {index !== items.length - 1 && " > "}
        </React.Fragment>
      ))}
    </div>
  );
};
