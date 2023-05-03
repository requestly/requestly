import React from "react";
import { Select, Space } from "antd";

interface FilterProps {
  filterId: string;
  filterPlaceholder: string;
  options: [];
  handleFilterChange?: (options: []) => void;
}

export const TrafficFilter: React.FC<FilterProps> = ({ filterId, filterPlaceholder, options, handleFilterChange }) => {
  return (
    <Space direction="vertical">
      <label htmlFor={filterId} style={{ marginLeft: 25 }}>
        Status code:
      </label>
      <Select
        id={filterId}
        style={{ width: 220, marginLeft: 25 }}
        mode="multiple"
        placeholder={filterPlaceholder}
        options={options}
        onChange={(options: any) => handleFilterChange(options)}
      />
    </Space>
  );
};
