import { Divider, Input, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { NetworkFilters, ResourceTypeFilter } from "../../types";
import "./networkPanelToolbar.scss";

interface Props {
  onFiltersChange: (filters: NetworkFilters) => void;
}

const FiltersToolbar: React.FC<Props> = ({ onFiltersChange }) => {
  const [urlFilter, setUrlFilter] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState(
    ResourceTypeFilter.ALL
  );

  useEffect(() => {
    onFiltersChange({
      url: urlFilter,
      resourceType: resourceTypeFilter,
    });
  }, [urlFilter, resourceTypeFilter]);

  return (
    <div className="network-panel-toolbar filters">
      <Input
        className="url-filter"
        placeholder="Filter by URL"
        value={urlFilter}
        onChange={(e) => setUrlFilter(e.target.value)}
        allowClear
      />
      <Radio.Group
        size="small"
        className="resource-type-filter"
        value={resourceTypeFilter}
        onChange={(e) => setResourceTypeFilter(e.target.value)}
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
