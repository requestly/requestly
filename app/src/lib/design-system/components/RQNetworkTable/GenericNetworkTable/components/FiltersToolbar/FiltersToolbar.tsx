import React, { useCallback, useState } from "react";
import { Divider, Input } from "antd";
import { useDebounce } from "hooks/useDebounce";
import { FilterKeys, NetworkFilters } from "./types";
import { StatusCodeFilter } from "./StatusCodeFilter";
import { MethodFilter } from "./MethodFilter";
import "./filtersToolbar.scss";

interface Props {
  filters: NetworkFilters;
  setFilters: (filters: NetworkFilters) => void;
  disabled?: boolean;
}

const FiltersToolbar: React.FC<Props> = ({ filters, setFilters, disabled = false }) => {
  const [searchValue, setSearchValue] = useState(filters?.search ?? "");
  const [statusCodeFilters, setStatusCodeFilters] = useState(filters?.statusCode ?? []);
  const [methodFilters, setMethodFilters] = useState(filters?.method ?? []);

  const onSearchFilterChange = (searchValue: string) => {
    setFilters({ ...filters, search: searchValue });
  };

  const onGroupFilterChange = useCallback(
    (newFilters: string[], filterType: FilterKeys) => {
      if (filterType === FilterKeys.STATUS_CODE) {
        setStatusCodeFilters([...newFilters]);
        setFilters({ ...filters, statusCode: [...newFilters] });
      } else if (filterType === FilterKeys.METHOD) {
        setMethodFilters([...newFilters]);
        setFilters({ ...filters, method: [...newFilters] });
      }
    },
    [filters, setStatusCodeFilters, setFilters]
  );

  const debouncedSearchFilter = useDebounce((value: string) => onSearchFilterChange(value));

  if (disabled) return null;

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
      <StatusCodeFilter
        statusCodeFilters={statusCodeFilters}
        handleStatusCodeFilterChange={(groups) => onGroupFilterChange(groups, FilterKeys.STATUS_CODE)}
      />
      <Divider type="vertical" orientation="center" className="filters-divider" />
      <MethodFilter
        methodFilters={methodFilters}
        handleMethodsFilterChange={(methods) => onGroupFilterChange(methods, FilterKeys.METHOD)}
      />
    </div>
  );
};

export default FiltersToolbar;
