import React, { useCallback, useState } from "react";
import { Divider, Input } from "antd";
import { useDebounce } from "hooks/useDebounce";
import { NetworkFilters } from "./types";
import { StatusCodeFilter } from "./StatusCodeFilter";
import "./filtersToolbar.scss";

interface Props {
  filters: NetworkFilters;
  setFilters: (filters: NetworkFilters) => void;
}

const FiltersToolbar: React.FC<Props> = ({ filters, setFilters }) => {
  const [searchValue, setSearchValue] = useState(filters?.search ?? "");
  const [statusCodeFilters, setStatusCodeFilters] = useState(filters?.statusCode ?? []);

  console.log({ filters });

  const onSearchFilterChange = (searchValue: string) => {
    setFilters({ ...filters, search: searchValue });
  };

  const onStatusCodeFilterChange = useCallback(
    (statusCode: string) => {
      const currentFilters = statusCodeFilters;

      if (currentFilters.indexOf(statusCode) !== -1) {
        currentFilters.splice(currentFilters.indexOf(statusCode), 1);
        setStatusCodeFilters(currentFilters);
        setFilters({ ...filters, statusCode: currentFilters });
      } else {
        setStatusCodeFilters((prev) => [...prev, statusCode]);
        setFilters({ ...filters, statusCode: [...currentFilters, statusCode] });
      }
    },
    [statusCodeFilters, filters, setFilters]
  );

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
      <Divider type="vertical" orientation="center" className="filters-divider" />
      <StatusCodeFilter statusCodeFilters={statusCodeFilters} handleStatusCodeFilterChange={onStatusCodeFilterChange} />
    </div>
  );
};

export default FiltersToolbar;
