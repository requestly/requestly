import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";

const methods = ["GET", "POST", "PUT", "PATCH"];

interface MethodFilterProps {
  methodFilters: string[];
  handleMethodsFilterChange: (method: string[]) => void;
}

export const MethodFilter: React.FC<MethodFilterProps> = ({ methodFilters, handleMethodsFilterChange }) => {
  const handleMethodsClick = (method: string) => {
    const filters = methodFilters;
    if (filters.indexOf(method) !== -1) {
      filters.splice(filters.indexOf(method), 1);
    } else filters.push(method);
    handleMethodsFilterChange(filters);
  };

  return (
    <Col className="btn-group-filters-wrapper">
      <Row className="status-code-filter-btns">
        {methods.map((method, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            onClick={() => handleMethodsClick(method)}
            className={`filter-btn ${methodFilters.indexOf(method) !== -1 ? "active-filter-btn" : null} `}
          >
            {method}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
