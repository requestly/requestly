import React from "react";
import { Select, Space } from "antd";

interface FilterProps {
  filterId: string;
  filterLabel: string;
  filterPlaceholder: string;
  options: [];
  handleFilterChange?: (options: []) => void;
}

export const TrafficFilter: React.FC<FilterProps> = ({
  filterId,
  filterLabel,
  filterPlaceholder,
  options,
  handleFilterChange,
}) => {
  return (
    <Space direction="vertical">
      <label htmlFor={filterId} className="traffic-table-filter-label" style={{ marginLeft: 25 }}>
        {filterLabel}
      </label>
      <Select
        allowClear
        id={filterId}
        className="traffic-table-filter-select"
        mode="multiple"
        placeholder={filterPlaceholder}
        options={options}
        onChange={(options: any) => handleFilterChange(options)}
      />
    </Space>
  );
};
