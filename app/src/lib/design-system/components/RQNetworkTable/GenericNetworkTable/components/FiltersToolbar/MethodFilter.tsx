import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";
import { FilterKeys } from "./types";

const methods = ["GET", "POST", "PUT"];

interface MethodFilterProps {
  methodFilters: string[];
  handleMethodsFilterChange: (method: string, key: FilterKeys) => void;
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
            onClick={() => handleMethodsFilterChange(method, FilterKeys.METHOD)}
            className={`filter-btn ${methodFilters.indexOf(method) !== -1 ? "active-filter-btn" : null} `}
          >
            {method}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
