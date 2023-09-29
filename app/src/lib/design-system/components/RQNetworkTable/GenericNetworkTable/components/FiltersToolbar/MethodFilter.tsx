import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";

const methods = ["GET", "POST", "PUT"];

interface MethodFilterProps {
  methodFilters: string[];
  handleMethodsFilterChange: (method: string) => void;
}

export const MethodFilter: React.FC<MethodFilterProps> = ({ methodFilters, handleMethodsFilterChange }) => {
  return (
    <Col className="btn-group-filters-wrapper">
      <Row className="status-code-filter-btns">
        {methods.map((method, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            onClick={() => handleMethodsFilterChange(method)}
            className={`filter-btn ${methodFilters.indexOf(method) !== -1 ? "active-filter-btn" : null} `}
          >
            {method}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
