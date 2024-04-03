import React from "react";
import { Select, Space } from "antd";

interface FilterProps {
  filterId: string;
  filterLabel: string;
  filterPlaceholder: string;
  value: string[];
  options: [];
  handleFilterChange?: (options: []) => void;
}

export const LogFilter: React.FC<FilterProps> = ({
  filterId,
  filterLabel,
  filterPlaceholder,
  value,
  options,
  handleFilterChange,
}) => {
  return (
    <Space direction="vertical">
      <label htmlFor={filterId} className="traffic-table-filter-label">
        {filterLabel}
      </label>
      <Select
        id={filterId}
        className="traffic-table-filter-select"
        mode={filterId === "filter-status-code" ? "tags" : "multiple"}
        value={value}
        placeholder={filterPlaceholder}
        options={options}
        onChange={(options: any) => handleFilterChange(options)}
      />
    </Space>
  );
};
