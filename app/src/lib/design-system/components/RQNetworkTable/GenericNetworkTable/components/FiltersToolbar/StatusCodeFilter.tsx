import React from "react";
import { Col, Row, Typography } from "antd";
import { RQButton } from "lib/design-system/components/RQButton";

const statusCodesGroups = ["1XX", "2XX", "3XX", "4XX", "5XX"];

interface StatusCodeFilterProps {
  statusCodeFilters: string[];
  handleStatusCodeFilterChange: (code: string) => void;
}

export const StatusCodeFilter: React.FC<StatusCodeFilterProps> = ({
  statusCodeFilters,
  handleStatusCodeFilterChange,
}) => {
  console.log({ statusCodeFilters });
  return (
    <Col className="status-code-filters-wrapper">
      <Typography.Text>Status code</Typography.Text>
      <Row className="status-code-filter-btns">
        {statusCodesGroups.map((code, index) => (
          <RQButton
            type="default"
            size="small"
            key={index}
            onClick={() => handleStatusCodeFilterChange(code)}
            className={`filter-btn ${statusCodeFilters.indexOf(code) !== -1 ? "active-filter-btn" : null} `}
          >
            {code}
          </RQButton>
        ))}
      </Row>
    </Col>
  );
};
