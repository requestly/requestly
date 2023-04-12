import React from "react";
import { Divider, Radio } from "antd";
import { ResourceTypeFilterValue } from "./types";
import "./resourceTypeFilter.scss";

interface Props {
  value?: ResourceTypeFilterValue;
  onChange: (value: ResourceTypeFilterValue) => void;
}

const ResourceTypeFilter: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Radio.Group size="small" className="resource-type-filter" value={value} onChange={(e) => onChange(e.target.value)}>
      <Radio.Button value={ResourceTypeFilterValue.ALL}>All</Radio.Button>
      <Divider type="vertical" className="divider" />
      <Radio.Button value={ResourceTypeFilterValue.AJAX}>Fetch/XHR</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.JS}>JS</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.CSS}>CSS</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.IMG}>Img</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.MEDIA}>Media</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.FONT}>Font</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.DOC}>Doc</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.WS}>WS</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.WASM}>Wasm</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.MANIFEST}>Manifest</Radio.Button>
      <Radio.Button value={ResourceTypeFilterValue.OTHER}>Other</Radio.Button>
    </Radio.Group>
  );
};

export default ResourceTypeFilter;
