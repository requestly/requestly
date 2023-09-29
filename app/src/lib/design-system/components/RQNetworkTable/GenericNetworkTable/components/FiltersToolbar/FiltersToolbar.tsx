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
}

const FiltersToolbar: React.FC<Props> = ({ filters, setFilters }) => {
  const [searchValue, setSearchValue] = useState(filters?.search ?? "");
  const [statusCodeFilters, setStatusCodeFilters] = useState(filters?.statusCode ?? []);
  const [methodFilters, setMethodFilters] = useState(filters?.method ?? []);

  const onSearchFilterChange = (searchValue: string) => {
    setFilters({ ...filters, search: searchValue });
  };

  const onGroupFilterChange = useCallback(
    (filterValue: string, filterType: string) => {
      const currentFilter = filterType === FilterKeys.STATUS_CODE ? statusCodeFilters : methodFilters;

      if (currentFilter.indexOf(filterValue) !== -1) {
        currentFilter.splice(currentFilter.indexOf(filterValue), 1);
      } else {
        currentFilter.push(filterValue);
      }

      if (filterType === FilterKeys.STATUS_CODE) {
        setStatusCodeFilters([...currentFilter]);
        setFilters({ ...filters, statusCode: [...currentFilter] });
      } else if (filterType === FilterKeys.METHOD) {
        setMethodFilters([...currentFilter]);
        setFilters({ ...filters, method: [...currentFilter] });
      }
    },
    [statusCodeFilters, methodFilters, filters, setStatusCodeFilters, setMethodFilters, setFilters]
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
      <StatusCodeFilter statusCodeFilters={statusCodeFilters} handleStatusCodeFilterChange={onGroupFilterChange} />
      <Divider type="vertical" orientation="center" className="filters-divider" />
      <MethodFilter methodFilters={methodFilters} handleMethodsFilterChange={onGroupFilterChange} />
    </div>
  );
};

export default FiltersToolbar;
