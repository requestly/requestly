import React, { ReactNode } from "react";
import { Button, Col, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Filter, FilterType } from "./type";
import "./contentListHeader.scss";
import { useNavigate, useSearchParams } from "react-router-dom";

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
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeFilter = searchParams.get("filter") || "all";

  const setFilter = (newFilter: FilterType) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("filter", newFilter);
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

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
          {filters?.length > 0
            ? filters.map(({ key, label, onClick }) => (
                <Button
                  className={`filter-btn ${key === activeFilter ? "active" : ""}`}
                  key={key}
                  onClick={() => {
                    onClick?.();
                    setFilter(key as FilterType);
                  }}
                  type={key === activeFilter ? "default" : "text"}
                >
                  {label}
                </Button>
              ))
            : null}
        </div>
      </div>
      {actions ? (
        <div className="rq-content-list-header-actions">
          {actions.map((action, index) => (
            <Col key={index}>{action}</Col>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ContentListHeader;
