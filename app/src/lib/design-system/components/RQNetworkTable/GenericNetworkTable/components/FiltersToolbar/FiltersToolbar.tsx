import React, { useState } from "react";
import { Input } from "antd";
import { useDebounce } from "hooks/useDebounce";

import "./filtersToolbar.scss";

export interface Filters {
  search?: string;
}

interface Props {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const FiltersToolbar: React.FC<Props> = ({ filters, setFilters }) => {
  const [searchValue, setSearchValue] = useState(filters?.search ?? "");
  const onSearchFilterChange = (searchValue: string) => {
    setFilters({ ...filters, search: searchValue });
  };
  const debouncedSearchFilter = useDebounce((value: string) => onSearchFilterChange(value));

  return (
    <div className="filters-toolbar">
      <Input
        className="search-filter"
        placeholder="Filter by URL"
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          debouncedSearchFilter(e.target.value);
        }}
        allowClear
      />
    </div>
  );
};

export default FiltersToolbar;
