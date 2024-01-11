import React from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";

const statusCodesGroups = ["1XX", "2XX", "3XX", "4XX", "5XX"];

interface StatusCodeFilterProps {
  statusCodeFilters: string[];
  handleStatusCodeFilterChange: (group: string[]) => void;
}

export const StatusCodeFilter: React.FC<StatusCodeFilterProps> = ({
  statusCodeFilters,
  handleStatusCodeFilterChange,
}) => {
  const handleStatusCodeClick = (group: string) => {
    const filters = statusCodeFilters;
    if (filters.indexOf(group) !== -1) {
      filters.splice(filters.indexOf(group), 1);
    } else filters.push(group);
    handleStatusCodeFilterChange(filters);
  };

  return (
    <Col className="btn-group-filters-wrapper">
      <Row className="status-code-filter-btns">
        {statusCodesGroups.map((group, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            onClick={() => handleStatusCodeClick(group)}
            className={`filter-btn ${statusCodeFilters.indexOf(group) !== -1 ? "active-filter-btn" : null} `}
          >
            {group}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
