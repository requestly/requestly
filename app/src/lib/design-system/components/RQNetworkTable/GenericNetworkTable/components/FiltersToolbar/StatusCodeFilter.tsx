import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";
import { FilterKeys } from "./types";

const statusCodesGroups = ["1XX", "2XX", "3XX", "4XX", "5XX"];

interface StatusCodeFilterProps {
  statusCodeFilters: string[];
  handleStatusCodeFilterChange: (code: string, key: FilterKeys) => void;
}

export const StatusCodeFilter: React.FC<StatusCodeFilterProps> = ({
  statusCodeFilters,
  handleStatusCodeFilterChange,
}) => {
  return (
    <Col className="btn-group-filters-wrapper">
      <Row className="status-code-filter-btns">
        {statusCodesGroups.map((group, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            onClick={() => handleStatusCodeFilterChange(group, FilterKeys.STATUS_CODE)}
            className={`filter-btn ${statusCodeFilters.indexOf(group) !== -1 ? "active-filter-btn" : null} `}
          >
            {group}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
