import { Input } from "antd";
import React, { useCallback } from "react";
import { ExecutionFilters } from "../../../types";
import { ResourceTypeFilter, ResourceTypeFilterValue } from "../../../components/ResourceTypeFilter";

interface Props {
  filters: ExecutionFilters;
  onFiltersChange: (filters: ExecutionFilters) => void;
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

  const onRuleNameFilterChange = useCallback(
    (newRuleNameFilter: string) => {
      onFiltersChange({
        ...filters,
        ruleName: newRuleNameFilter,
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
    <div className="executions-toolbar filters">
      <Input
        className="url-filter"
        addonBefore="URL"
        placeholder="Filter by URL"
        value={filters.url}
        onChange={(e) => onUrlFilterChange(e.target.value)}
        allowClear
      />
      <Input
        className="rule-filter"
        addonBefore="Rule name"
        placeholder="Filter by Rule name"
        value={filters.ruleName}
        onChange={(e) => onRuleNameFilterChange(e.target.value)}
        allowClear
      />
      <ResourceTypeFilter value={filters.resourceType} onChange={onResourceTypeFilterChange} />
    </div>
  );
};

export default FiltersToolbar;
