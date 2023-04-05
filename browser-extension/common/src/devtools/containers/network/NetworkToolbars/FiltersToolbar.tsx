import { Divider, Input, Radio } from "antd";
import React, { useCallback } from "react";
import { NetworkFilters, ResourceTypeFilter } from "../../../types";

interface Props {
  filters: NetworkFilters;
  onFiltersChange: (filters: NetworkFilters) => void;
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
    (newResourceTypeFilter: ResourceTypeFilter) => {
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
        placeholder="Filter by URL"
        value={filters.url}
        onChange={(e) => onUrlFilterChange(e.target.value)}
        allowClear
      />
      <Radio.Group
        size="small"
        className="resource-type-filter"
        value={filters.resourceType}
        onChange={(e) => onResourceTypeFilterChange(e.target.value)}
      >
        <Radio.Button value={ResourceTypeFilter.ALL}>All</Radio.Button>
        <Divider type="vertical" className="divider" />
        <Radio.Button value={ResourceTypeFilter.AJAX}>Fetch/XHR</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.JS}>JS</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.CSS}>CSS</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.IMG}>Img</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.MEDIA}>Media</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.FONT}>Font</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.DOC}>Doc</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.WS}>WS</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.WASM}>Wasm</Radio.Button>
        <Radio.Button value={ResourceTypeFilter.MANIFEST}>
          Manifest
        </Radio.Button>
        <Radio.Button value={ResourceTypeFilter.OTHER}>Other</Radio.Button>
      </Radio.Group>
    </div>
  );
};

export default FiltersToolbar;
