import React, { ReactNode } from "react";
import { Button, Col, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Filter, FilterType } from "./type";
import "./contentHeader.scss";

export interface ContentHeaderProps {
  title: ReactNode;
  subtitle: ReactNode;
  actions?: ReactNode[];
  searchValue?: string;
  setSearchValue?: (s: string) => void;
  filters?: Filter[];
  activeFilter?: FilterType;
}

// Contains common design and colors for app
export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  subtitle,
  actions,
  searchValue,
  setSearchValue,
  filters = [],
  activeFilter,
}) => {
  return (
    <div>
      <Row justify="space-between" align="bottom" className="content-header-container">
        <Col span={12}>
          <div className="content-header-title">{title}</div>
          <div className="content-header-subtitle">{subtitle}</div>
        </Col>
        <Col className="ml-auto">
          <Row align="middle" className="content-header-actions">
            {actions.map((action) => (
              <Col>{action}</Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Row align="middle" className="filters-container">
        {searchValue !== undefined ? (
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by rule name"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
        ) : null}

        {/* TODO: refactor with antd's Segmented component */}
        <div className="filters">
          {filters.length > 0
            ? filters.map(({ key, label, onClick }) => (
                <div className={`filter-btn ${key === activeFilter ? "active" : ""}`}>
                  <Button key={key} onClick={onClick} type={key === activeFilter ? "primary" : "text"}>
                    {label}
                  </Button>
                </div>
              ))
            : null}
        </div>
      </Row>
    </div>
  );
};
