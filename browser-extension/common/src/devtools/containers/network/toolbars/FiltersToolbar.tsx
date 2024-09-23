import { Input } from "antd";
import React, { useCallback } from "react";
import { ResourceFilters } from "../../../types";
import { ResourceTypeFilter, ResourceTypeFilterValue } from "../../../components/ResourceTypeFilter";

interface Props {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
}

const FiltersToolbar: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const onUrlFilterChange = useCallback(
    (newUrlFilter: string) => {
      onFiltersChange({
        ...filters,
        url: newUrlFilter,
      });
    },
    [filters]
  );

  const onResourceTypeFilterChange = useCallback(
    (newResourceTypeFilter: ResourceTypeFilterValue) => {
      onFiltersChange({
        ...filters,
        resourceType: newResourceTypeFilter,
      });
    },
    [filters]
  );

  return (
    <div className="network-toolbar filters">
      <Input
        className="url-filter"
        placeholder="Filter"
        value={filters.url}
        onChange={(e) => onUrlFilterChange(e.target.value)}
        allowClear
      />
      <ResourceTypeFilter value={filters.resourceType} onChange={onResourceTypeFilterChange} />
    </div>
  );
};

export default FiltersToolbar;
