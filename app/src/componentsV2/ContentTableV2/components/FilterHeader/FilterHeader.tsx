import { FilterConfig, FilterHeaderConfig } from "componentsV2/ContentTable/types";
import "./filterHeader.scss";
import { Button, Input } from "antd";
import { useState } from "react";

export interface Props {
  filters: { [key: string]: any[] };
  setFilters: (filters: any) => void;
  config: FilterHeaderConfig;
}

// Contains common design and colors for app
const FilterHeader: React.FC<Props> = ({ filters, setFilters, config }) => {
  const [quickFilter, setQuickFilter] = useState(null);

  const handleSearchFilterChange = (value: string) => {
    setFilters({ ...filters, search: value ?? "" });
  };

  const renderSearchInput = () => {
    if (config.search) {
      return (
        <Input
          placeholder="Search"
          value={filters?.search}
          onChange={(e) => handleSearchFilterChange(e.target.value)}
        />
      ); // FIXME: Add debouncing
    }
    return null;
  };

  const renderQuickFilters = () => {
    return (
      <>
        <Button onClick={() => setQuickFilter(null)} type={quickFilter === null ? "primary" : "default"}>
          All
        </Button>
        {config.quickFilters.map((q) => {
          let filter = null;
          config.filters.forEach((f) => {
            if (f.key === q) {
              filter = f;
            }
          });

          return (
            <Button onClick={() => setQuickFilter(q)} type={q === quickFilter ? "primary" : "default"}>
              {/* @ts-ignore */}
              {filter?.label}
            </Button>
          );
        })}
      </>
    );
  };

  return (
    <>
      {renderSearchInput()}
      {renderQuickFilters()}
    </>
  );
};

export default FilterHeader;
