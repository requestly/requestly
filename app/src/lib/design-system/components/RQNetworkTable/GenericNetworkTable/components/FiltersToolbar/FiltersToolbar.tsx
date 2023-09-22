import React from "react";
import { Input } from "antd";

import "./filtersToolbar.scss";

export interface Filters {
  search?: string;
}

interface Props {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const FiltersToolbar: React.FC<Props> = ({ filters, setFilters }) => {
  const onSearchFilterChange = (searchValue: string) => {
    setFilters({ ...filters, search: searchValue });
  };

  return (
    <div className="filters-toolbar">
      <Input
        className="search-filter"
        placeholder="Filter by URL"
        value={filters.search}
        onChange={(e) => onSearchFilterChange(e.target.value)}
        allowClear
      />
    </div>
  );
};

export default FiltersToolbar;
