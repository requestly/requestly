import React, { ReactNode } from "react";
import { Button, Col, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Filter, FilterType } from "./type";
import "./contentListHeader.scss";

export interface ContentListHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode[];
  searchValue?: string;
  setSearchValue?: (s: string) => void;
  filters?: Filter[];
  activeFilter?: FilterType;
}

// Contains common design and colors for app
const ContentListHeader: React.FC<ContentListHeaderProps> = ({
  title,
  subtitle,
  actions,
  searchValue,
  setSearchValue,
  filters = [],
  activeFilter,
}) => {
  return (
    <div className="rq-content-list-header">
      <div className="rq-content-list-header-filters">
        {searchValue !== undefined ? (
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="rq-content-list-header-search-input"
          />
        ) : null}
        <div className="filter-btns">
          {filters.length > 0
            ? filters.map(({ key, label, onClick }) => (
                <Button
                  className={`filter-btn ${key === activeFilter ? "active" : ""}`}
                  key={key}
                  onClick={onClick}
                  type={key === activeFilter ? "default" : "text"}
                >
                  {label}
                </Button>
              ))
            : null}
        </div>
      </div>
      <div className="rq-content-list-header-actions">
        {actions.map((action) => (
          <Col>{action}</Col>
        ))}
      </div>
    </div>
  );
};

export default ContentListHeader;
